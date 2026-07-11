import React, { useState } from "react";
import { SiteContent, Offer, ComboDeal, Gift, EMIOffer } from "@/data/siteContent";
import { saveSiteContentApi } from "@/lib/apiClient";
import ImageUploader from "@/components/ImageUploader";
import { Plus, Trash2, AlertCircle, Save, CheckCircle, Loader2 } from "lucide-react";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] font-bold uppercase text-[#666666] tracking-wider mb-1">{children}</label>;
}

function FieldInput({ value, onChange, placeholder = "", type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; }) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-white border border-[#E2E2DF] px-3 py-2.5 text-sm text-[#222222] focus:outline-none focus:border-[#7A2E2E] transition-colors" />
  );
}

function FieldTextarea({ value, onChange, placeholder = "", rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; }) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="w-full bg-white border border-[#E2E2DF] px-3 py-2.5 text-sm text-[#222222] focus:outline-none focus:border-[#7A2E2E] transition-colors resize-none" />
  );
}

function SaveBar({ onSave, saved, saving = false }: { onSave: () => void; saved: boolean; saving?: boolean; }) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-[#E2E2DF] px-6 py-3 flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#666666]">Editing — changes saved to server</span>
      <button onClick={onSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 bg-[#7A2E2E] hover:bg-[#5F2222] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider transition-colors">
        {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? <CheckCircle size={13} /> : <Save size={13} />}
        {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
      </button>
    </div>
  );
}

interface TabProps {
  content: SiteContent;
  setContent: React.Dispatch<React.SetStateAction<SiteContent>>;
  token: string;
}

export function OffersTab({ content, setContent, token }: TabProps) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    const result = await saveSiteContentApi(content, token);
    setSaving(false);
    if (result.ok) {
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } else {
      setSaveError(result.error ?? "Save failed.");
    }
  };

  const addOffer = () => {
    setContent(c => ({ ...c, offers: [{ id: `off-${Date.now()}`, title: "", description: "", image: "", terms: "" }, ...c.offers] }));
  };

  const removeOffer = (id: string) => {
    setContent(c => ({ ...c, offers: c.offers.filter(o => o.id !== id) }));
  };

  const updateOffer = (id: string, field: keyof Offer, value: string) => {
    setContent(c => ({ ...c, offers: c.offers.map(o => o.id === id ? { ...o, [field]: value } : o) }));
  };

  return (
    <div>
      <SaveBar onSave={handleSave} saved={saved} saving={saving} />
      {saveError && <div className="mx-6 mt-3 flex items-center gap-2 text-[#7A2E2E] bg-[#7A2E2E]/5 border border-[#7A2E2E]/20 px-3 py-2"><AlertCircle size={13} /><span className="text-xs font-semibold">{saveError}</span></div>}
      <div className="p-6 max-w-3xl space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Section Label</FieldLabel>
            <FieldInput value={content.offersLabel} onChange={v => setContent(c => ({ ...c, offersLabel: v }))} />
          </div>
          <div>
            <FieldLabel>Section Heading</FieldLabel>
            <FieldInput value={content.offersHeading} onChange={v => setContent(c => ({ ...c, offersHeading: v }))} />
          </div>
        </div>
        
        <button type="button" onClick={addOffer} className="px-5 py-2 bg-[#7A2E2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5F2222] transition-colors flex items-center gap-2"><Plus size={13} /> Add Offer</button>
        
        <div className="space-y-6">
          {content.offers.map((offer) => (
            <div key={offer.id} className="bg-[#F8F8F6] border border-[#E2E2DF] p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A6A44]">Offer Details</span>
                <button type="button" onClick={() => removeOffer(offer.id)} className="text-[10px] font-bold uppercase tracking-wider text-[#7A2E2E] hover:underline flex items-center gap-1"><Trash2 size={11} /> Remove</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div><FieldLabel>Title</FieldLabel><FieldInput value={offer.title} onChange={v => updateOffer(offer.id, "title", v)} placeholder="e.g. Diwali Dhamaka" /></div>
                  <div><FieldLabel>Description</FieldLabel><FieldTextarea value={offer.description} onChange={v => updateOffer(offer.id, "description", v)} rows={2} /></div>
                  <div><FieldLabel>Terms & Conditions</FieldLabel><FieldInput value={offer.terms} onChange={v => updateOffer(offer.id, "terms", v)} placeholder="e.g. Valid till stocks last" /></div>
                </div>
                <div><ImageUploader label="Offer Banner Image" value={offer.image} onChange={v => updateOffer(offer.id, "image", v)} aspectHint="landscape" /></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CombosTab({ content, setContent, token }: TabProps) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleSave = async () => {
    setSaving(true); setSaveError("");
    const result = await saveSiteContentApi(content, token);
    setSaving(false);
    if (result.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); } else { setSaveError(result.error ?? "Save failed."); }
  };

  const addCombo = () => setContent(c => ({ ...c, comboDeals: [{ id: `com-${Date.now()}`, title: "", description: "", items: "", price: "" }, ...c.comboDeals] }));
  const removeCombo = (id: string) => setContent(c => ({ ...c, comboDeals: c.comboDeals.filter(o => o.id !== id) }));
  const updateCombo = (id: string, field: keyof ComboDeal, value: string) => setContent(c => ({ ...c, comboDeals: c.comboDeals.map(o => o.id === id ? { ...o, [field]: value } : o) }));

  return (
    <div>
      <SaveBar onSave={handleSave} saved={saved} saving={saving} />
      {saveError && <div className="mx-6 mt-3 flex items-center gap-2 text-[#7A2E2E] bg-[#7A2E2E]/5 border border-[#7A2E2E]/20 px-3 py-2"><AlertCircle size={13} /><span className="text-xs font-semibold">{saveError}</span></div>}
      <div className="p-6 max-w-3xl space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div><FieldLabel>Section Label</FieldLabel><FieldInput value={content.comboDealsLabel} onChange={v => setContent(c => ({ ...c, comboDealsLabel: v }))} /></div>
          <div><FieldLabel>Section Heading</FieldLabel><FieldInput value={content.comboDealsHeading} onChange={v => setContent(c => ({ ...c, comboDealsHeading: v }))} /></div>
        </div>
        <button type="button" onClick={addCombo} className="px-5 py-2 bg-[#7A2E2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5F2222] transition-colors flex items-center gap-2"><Plus size={13} /> Add Combo Deal</button>
        <div className="space-y-4">
          {content.comboDeals.map((combo) => (
            <div key={combo.id} className="bg-[#F8F8F6] border border-[#E2E2DF] p-4 space-y-3">
              <div className="flex justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-[#8A6A44]">Combo Details</span><button type="button" onClick={() => removeCombo(combo.id)} className="text-[10px] font-bold uppercase tracking-wider text-[#7A2E2E] hover:underline flex items-center gap-1"><Trash2 size={11} /> Remove</button></div>
              <div className="grid grid-cols-2 gap-4">
                <div><FieldLabel>Title</FieldLabel><FieldInput value={combo.title} onChange={v => updateCombo(combo.id, "title", v)} placeholder="e.g. Starter Pack" /></div>
                <div><FieldLabel>Price</FieldLabel><FieldInput value={combo.price} onChange={v => updateCombo(combo.id, "price", v)} placeholder="e.g. ₹2,999" /></div>
              </div>
              <div><FieldLabel>Items Included (Comma separated)</FieldLabel><FieldInput value={combo.items} onChange={v => updateCombo(combo.id, "items", v)} placeholder="e.g. Phone, Case, Earbuds" /></div>
              <div><FieldLabel>Description</FieldLabel><FieldTextarea value={combo.description} onChange={v => updateCombo(combo.id, "description", v)} rows={2} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GiftsTab({ content, setContent, token }: TabProps) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleSave = async () => {
    setSaving(true); setSaveError("");
    const result = await saveSiteContentApi(content, token);
    setSaving(false);
    if (result.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); } else { setSaveError(result.error ?? "Save failed."); }
  };

  const addGift = () => setContent(c => ({ ...c, gifts: [{ id: `gif-${Date.now()}`, title: "", description: "", conditions: "" }, ...c.gifts] }));
  const removeGift = (id: string) => setContent(c => ({ ...c, gifts: c.gifts.filter(o => o.id !== id) }));
  const updateGift = (id: string, field: keyof Gift, value: string) => setContent(c => ({ ...c, gifts: c.gifts.map(o => o.id === id ? { ...o, [field]: value } : o) }));

  return (
    <div>
      <SaveBar onSave={handleSave} saved={saved} saving={saving} />
      {saveError && <div className="mx-6 mt-3 flex items-center gap-2 text-[#7A2E2E] bg-[#7A2E2E]/5 border border-[#7A2E2E]/20 px-3 py-2"><AlertCircle size={13} /><span className="text-xs font-semibold">{saveError}</span></div>}
      <div className="p-6 max-w-3xl space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div><FieldLabel>Section Label</FieldLabel><FieldInput value={content.giftsLabel} onChange={v => setContent(c => ({ ...c, giftsLabel: v }))} /></div>
          <div><FieldLabel>Section Heading</FieldLabel><FieldInput value={content.giftsHeading} onChange={v => setContent(c => ({ ...c, giftsHeading: v }))} /></div>
        </div>
        <button type="button" onClick={addGift} className="px-5 py-2 bg-[#7A2E2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5F2222] transition-colors flex items-center gap-2"><Plus size={13} /> Add Free Gift Offer</button>
        <div className="space-y-4">
          {content.gifts.map((gift) => (
            <div key={gift.id} className="bg-[#F8F8F6] border border-[#E2E2DF] p-4 space-y-3">
              <div className="flex justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-[#8A6A44]">Gift Details</span><button type="button" onClick={() => removeGift(gift.id)} className="text-[10px] font-bold uppercase tracking-wider text-[#7A2E2E] hover:underline flex items-center gap-1"><Trash2 size={11} /> Remove</button></div>
              <div><FieldLabel>Title</FieldLabel><FieldInput value={gift.title} onChange={v => updateGift(gift.id, "title", v)} placeholder="e.g. Free Bluetooth Speaker" /></div>
              <div><FieldLabel>Conditions</FieldLabel><FieldInput value={gift.conditions} onChange={v => updateGift(gift.id, "conditions", v)} placeholder="e.g. On purchase of any Smart TV" /></div>
              <div><FieldLabel>Description</FieldLabel><FieldTextarea value={gift.description} onChange={v => updateGift(gift.id, "description", v)} rows={2} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EMITab({ content, setContent, token }: TabProps) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleSave = async () => {
    setSaving(true); setSaveError("");
    const result = await saveSiteContentApi(content, token);
    setSaving(false);
    if (result.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); } else { setSaveError(result.error ?? "Save failed."); }
  };

  const addEMI = () => setContent(c => ({ ...c, emiOffers: [{ id: `emi-${Date.now()}`, provider: "", plan: "", description: "" }, ...c.emiOffers] }));
  const removeEMI = (id: string) => setContent(c => ({ ...c, emiOffers: c.emiOffers.filter(o => o.id !== id) }));
  const updateEMI = (id: string, field: keyof EMIOffer, value: string) => setContent(c => ({ ...c, emiOffers: c.emiOffers.map(o => o.id === id ? { ...o, [field]: value } : o) }));

  return (
    <div>
      <SaveBar onSave={handleSave} saved={saved} saving={saving} />
      {saveError && <div className="mx-6 mt-3 flex items-center gap-2 text-[#7A2E2E] bg-[#7A2E2E]/5 border border-[#7A2E2E]/20 px-3 py-2"><AlertCircle size={13} /><span className="text-xs font-semibold">{saveError}</span></div>}
      <div className="p-6 max-w-3xl space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div><FieldLabel>Section Label</FieldLabel><FieldInput value={content.emiLabel} onChange={v => setContent(c => ({ ...c, emiLabel: v }))} /></div>
          <div><FieldLabel>Section Heading</FieldLabel><FieldInput value={content.emiHeading} onChange={v => setContent(c => ({ ...c, emiHeading: v }))} /></div>
        </div>
        <button type="button" onClick={addEMI} className="px-5 py-2 bg-[#7A2E2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5F2222] transition-colors flex items-center gap-2"><Plus size={13} /> Add EMI Option</button>
        <div className="space-y-4">
          {content.emiOffers.map((emi) => (
            <div key={emi.id} className="bg-[#F8F8F6] border border-[#E2E2DF] p-4 space-y-3">
              <div className="flex justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-[#8A6A44]">EMI Details</span><button type="button" onClick={() => removeEMI(emi.id)} className="text-[10px] font-bold uppercase tracking-wider text-[#7A2E2E] hover:underline flex items-center gap-1"><Trash2 size={11} /> Remove</button></div>
              <div className="grid grid-cols-2 gap-4">
                <div><FieldLabel>Provider Name</FieldLabel><FieldInput value={emi.provider} onChange={v => updateEMI(emi.id, "provider", v)} placeholder="e.g. Bajaj Finserv" /></div>
                <div><FieldLabel>Plan Details</FieldLabel><FieldInput value={emi.plan} onChange={v => updateEMI(emi.id, "plan", v)} placeholder="e.g. 0% Interest for 6 Months" /></div>
              </div>
              <div><FieldLabel>Description</FieldLabel><FieldTextarea value={emi.description} onChange={v => updateEMI(emi.id, "description", v)} rows={2} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
