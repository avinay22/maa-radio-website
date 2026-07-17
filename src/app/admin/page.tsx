"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Lock, LogOut, Save, Plus, Trash2, ShieldAlert, Sparkles,
  Building2, Image, Package, CheckCircle, AlertCircle, Loader2,
  Tag, Layers, ArrowUp, ArrowDown, Edit2, X
} from "lucide-react";
import { SiteContent, Category, DynamicOffer, GalleryItem, DEFAULT_SITE_CONTENT, OfferType } from "@/data/siteContent";
import { Product } from "@/data/products";
import ImageUploader from "@/components/ImageUploader";
import {
  fetchSiteContent, saveSiteContentApi,
  fetchProducts, saveProductsApi,
} from "@/lib/apiClient";
import { createClient } from "@/lib/supabase/client";

type Tab = "business" | "categories" | "offers" | "gallery" | "products";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-bold uppercase text-[#666666] tracking-wider mb-1">
      {children}
    </label>
  );
}

function FieldInput({
  value,
  onChange,
  placeholder = "",
  required = false,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full bg-white border border-[#E2E2DF] px-3 py-2.5 text-sm text-[#222222] focus:outline-none focus:border-[#7A2E2E] transition-colors"
    />
  );
}

function FieldTextarea({
  value,
  onChange,
  placeholder = "",
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-white border border-[#E2E2DF] px-3 py-2.5 text-sm text-[#222222] focus:outline-none focus:border-[#7A2E2E] transition-colors resize-none"
    />
  );
}

function SaveBar({
  onSave,
  saved,
  saving = false,
}: {
  onSave: () => void;
  saved: boolean;
  saving?: boolean;
}) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-[#E2E2DF] px-6 py-3 flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#666666]">
        Editing — changes saved to server
      </span>
      <button
        onClick={onSave}
        disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-2 bg-[#7A2E2E] hover:bg-[#5F2222] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
      >
        {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? <CheckCircle size={13} /> : <Save size={13} />}
        {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB — Business Info (Phone, WhatsApp, Hours, Maps Link)
// ─────────────────────────────────────────────────────────────────────────────
function BusinessTab({
  content,
  setContent,
  token,
}: {
  content: SiteContent;
  setContent: React.Dispatch<React.SetStateAction<SiteContent>>;
  token: string;
}) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const f = (key: keyof SiteContent) => (v: string) =>
    setContent((c) => ({ ...c, [key]: v }));

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    const result = await saveSiteContentApi(content, token);
    setSaving(false);
    if (result.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setSaveError(result.error ?? "Save failed.");
    }
  };

  return (
    <div>
      <SaveBar onSave={handleSave} saved={saved} saving={saving} />
      {saveError && (
        <div className="mx-6 mt-3 flex items-center gap-2 text-[#7A2E2E] bg-[#7A2E2E]/5 border border-[#7A2E2E]/20 px-3 py-2">
          <AlertCircle size={13} />
          <span className="text-xs font-semibold">{saveError}</span>
        </div>
      )}
      <div className="p-6 space-y-6 max-w-2xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222] border-b border-[#E2E2DF] pb-2">
          Business Contact Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <FieldLabel>Phone Number</FieldLabel>
            <FieldInput value={content.phone} onChange={f("phone")} placeholder="+91 70027 33658" />
          </div>
          <div>
            <FieldLabel>WhatsApp Number (digits only, e.g. 917002733658)</FieldLabel>
            <FieldInput value={content.whatsapp} onChange={f("whatsapp")} placeholder="917002733658" />
          </div>
        </div>
        <div>
          <FieldLabel>Business Hours</FieldLabel>
          <FieldInput value={content.hours} onChange={f("hours")} placeholder="Mon - Sat: 10:00 AM – 8:30 PM" />
        </div>
        <div>
          <FieldLabel>Google Maps Embed URL</FieldLabel>
          <FieldTextarea value={content.mapsEmbedUrl} onChange={f("mapsEmbedUrl")} rows={3} placeholder="Paste Google Maps embed src URL here" />
          <p className="text-[9px] text-[#8A6A44] mt-1">
            In Google Maps &rarr; Share &rarr; Embed a map &rarr; copy the src="" value only.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB — Categories (Add, Edit, Delete, Reorder)
// ─────────────────────────────────────────────────────────────────────────────
function CategoriesTab({
  content,
  setContent,
  token,
}: {
  content: SiteContent;
  setContent: React.Dispatch<React.SetStateAction<SiteContent>>;
  token: string;
}) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [catName, setCatName] = useState("");
  const [catImage, setCatImage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    const result = await saveSiteContentApi(content, token);
    setSaving(false);
    if (result.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setSaveError(result.error ?? "Save failed.");
    }
  };

  const handleAddOrEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catImage) {
      alert("Name and representative image are required.");
      return;
    }

    if (editingId) {
      // Edit
      setContent(c => ({
        ...c,
        categories: c.categories.map(cat => cat.id === editingId ? { ...cat, name: catName, image: catImage } : cat)
      }));
      setEditingId(null);
    } else {
      // Add
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: catName,
        image: catImage,
        sortOrder: content.categories.length + 1
      };
      setContent(c => ({
        ...c,
        categories: [...c.categories, newCat]
      }));
    }
    setCatName("");
    setCatImage("");
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this category? Products in this category will not be deleted but they won't have a linked category.")) return;
    setContent(c => ({
      ...c,
      categories: c.categories.filter(cat => cat.id !== id)
    }));
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setCatName(cat.name);
    setCatImage(cat.image);
  };

  const moveOrder = (index: number, direction: "up" | "down") => {
    const list = [...content.categories];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    // Swap items
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    // Recalculate sortOrder
    const updated = list.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    setContent(c => ({ ...c, categories: updated }));
  };

  const sortedCategories = [...content.categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <SaveBar onSave={handleSave} saved={saved} saving={saving} />
      {saveError && (
        <div className="mx-6 mt-3 flex items-center gap-2 text-[#7A2E2E] bg-[#7A2E2E]/5 border border-[#7A2E2E]/20 px-3 py-2">
          <AlertCircle size={13} />
          <span className="text-xs font-semibold">{saveError}</span>
        </div>
      )}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form */}
        <form onSubmit={handleAddOrEdit} className="lg:col-span-5 bg-[#F8F8F6] border border-[#E2E2DF] p-6 space-y-4 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222] border-b border-[#E2E2DF] pb-3 flex items-center gap-2">
            <Plus size={14} /> {editingId ? "Edit Category" : "Add New Category"}
          </h3>
          <div>
            <FieldLabel>Category Name *</FieldLabel>
            <FieldInput value={catName} onChange={setCatName} placeholder="e.g. Gaming Laptops & Laptops" required />
          </div>
          <div>
            <ImageUploader label="Category Representative Image *" value={catImage} onChange={setCatImage} aspectHint="square" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-3 bg-[#7A2E2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5F2222] transition-colors cursor-pointer">
              {editingId ? "Save Category" : "Add Category"}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setCatName(""); setCatImage(""); }} className="px-4 py-3 border border-[#E2E2DF] text-[#666666] hover:bg-white text-xs font-bold uppercase tracking-wider">
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Categories List */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222]">Categories List ({sortedCategories.length})</h3>
          {sortedCategories.length === 0 ? (
            <p className="text-xs text-[#666666] italic py-8 border border-dashed border-[#E2E2DF] text-center bg-[#F8F8F6]">No categories defined yet.</p>
          ) : (
            <div className="border border-[#E2E2DF] divide-y divide-[#E2E2DF]">
              {sortedCategories.map((cat, idx) => (
                <div key={cat.id} className="flex items-center justify-between p-4 bg-white hover:bg-[#F8F8F6]/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img src={cat.image} alt={cat.name} className="w-12 h-12 object-contain border border-[#E2E2DF] bg-white p-1" />
                    <div>
                      <h4 className="font-bold text-[#222222] text-sm">{cat.name}</h4>
                      <p className="text-[9px] text-[#8A6A44] font-semibold uppercase">Sort: {cat.sortOrder}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => moveOrder(idx, "up")} disabled={idx === 0} className="p-1.5 border border-[#E2E2DF] disabled:opacity-30 hover:border-[#7A2E2E] hover:text-[#7A2E2E] transition-colors">
                      <ArrowUp size={12} />
                    </button>
                    <button type="button" onClick={() => moveOrder(idx, "down")} disabled={idx === sortedCategories.length - 1} className="p-1.5 border border-[#E2E2DF] disabled:opacity-30 hover:border-[#7A2E2E] hover:text-[#7A2E2E] transition-colors">
                      <ArrowDown size={12} />
                    </button>
                    <button type="button" onClick={() => startEdit(cat)} className="p-1.5 border border-[#E2E2DF] hover:border-[#8A6A44] hover:text-[#8A6A44] transition-colors">
                      <Edit2 size={12} />
                    </button>
                    <button type="button" onClick={() => handleDelete(cat.id)} className="p-1.5 border border-[#E2E2DF] hover:border-red-600 hover:text-red-600 text-[#7A2E2E] transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB — Offers (Add, Edit, Delete, Enable/Disable, Start/End Dates)
// ─────────────────────────────────────────────────────────────────────────────
function OffersTab({
  content,
  setContent,
  token,
}: {
  content: SiteContent;
  setContent: React.Dispatch<React.SetStateAction<SiteContent>>;
  token: string;
}) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<OfferType>("Festival Offers");
  const [enabled, setEnabled] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [image, setImage] = useState("");
  const [terms, setTerms] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    const result = await saveSiteContentApi(content, token);
    setSaving(false);
    if (result.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setSaveError(result.error ?? "Save failed.");
    }
  };

  const handleAddOrEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      alert("Title and description are required.");
      return;
    }

    const offerData: DynamicOffer = {
      id: editingId || `off-${Date.now()}`,
      title,
      description,
      type,
      enabled,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      image: image || undefined,
      terms: terms || undefined
    };

    if (editingId) {
      setContent(c => ({
        ...c,
        offers: c.offers.map(o => o.id === editingId ? offerData : o)
      }));
      setEditingId(null);
    } else {
      setContent(c => ({
        ...c,
        offers: [offerData, ...c.offers]
      }));
    }

    setTitle("");
    setDescription("");
    setType("Festival Offers");
    setEnabled(true);
    setStartDate("");
    setEndDate("");
    setImage("");
    setTerms("");
  };

  const startEdit = (o: DynamicOffer) => {
    setEditingId(o.id);
    setTitle(o.title);
    setDescription(o.description);
    setType(o.type);
    setEnabled(o.enabled);
    setStartDate(o.startDate || "");
    setEndDate(o.endDate || "");
    setImage(o.image || "");
    setTerms(o.terms || "");
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this offer?")) return;
    setContent(c => ({ ...c, offers: c.offers.filter(o => o.id !== id) }));
  };

  const toggleEnable = (id: string) => {
    setContent(c => ({
      ...c,
      offers: c.offers.map(o => o.id === id ? { ...o, enabled: !o.enabled } : o)
    }));
  };

  return (
    <div>
      <SaveBar onSave={handleSave} saved={saved} saving={saving} />
      {saveError && (
        <div className="mx-6 mt-3 flex items-center gap-2 text-[#7A2E2E] bg-[#7A2E2E]/5 border border-[#7A2E2E]/20 px-3 py-2">
          <AlertCircle size={13} />
          <span className="text-xs font-semibold">{saveError}</span>
        </div>
      )}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form */}
        <form onSubmit={handleAddOrEdit} className="lg:col-span-5 bg-[#F8F8F6] border border-[#E2E2DF] p-6 space-y-4 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222] border-b border-[#E2E2DF] pb-3 flex items-center gap-2">
            <Plus size={14} /> {editingId ? "Edit Offer" : "Add New Offer"}
          </h3>
          <div>
            <FieldLabel>Offer Title *</FieldLabel>
            <FieldInput value={title} onChange={setTitle} placeholder="e.g. Wedding Package Discount" required />
          </div>
          <div>
            <FieldLabel>Offer Type *</FieldLabel>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as OfferType)}
              className="w-full bg-white border border-[#E2E2DF] px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A2E2E]"
            >
              <option value="Festival Offers">Festival Offers</option>
              <option value="Wedding Package Discounts">Wedding Package Discounts</option>
              <option value="Combo Offers">Combo Offers</option>
              <option value="Free Gifts">Free Gifts</option>
              <option value="Cashback Offers">Cashback Offers</option>
              <option value="EMI Available">EMI Available</option>
              <option value="Limited Time Deals">Limited Time Deals</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Start Date (optional)</FieldLabel>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-white border border-[#E2E2DF] px-3 py-2 text-sm text-[#222222] focus:outline-none focus:border-[#7A2E2E]" />
            </div>
            <div>
              <FieldLabel>End Date (optional)</FieldLabel>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-white border border-[#E2E2DF] px-3 py-2 text-sm text-[#222222] focus:outline-none focus:border-[#7A2E2E]" />
            </div>
          </div>
          <div>
            <FieldLabel>Description *</FieldLabel>
            <FieldTextarea value={description} onChange={setDescription} placeholder="Detail what the offer contains..." rows={3} />
          </div>
          <div>
            <FieldLabel>Terms & Conditions (optional)</FieldLabel>
            <FieldInput value={terms} onChange={setTerms} placeholder="e.g. Minimum purchase of ₹50,000" />
          </div>
          <div>
            <ImageUploader label="Offer Banner Image (optional)" value={image} onChange={setImage} aspectHint="landscape" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="rounded border-[#E2E2DF]" />
            <span className="text-xs text-[#666666] font-bold uppercase tracking-wider">Enable this Offer</span>
          </label>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-3 bg-[#7A2E2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5F2222] transition-colors cursor-pointer">
              {editingId ? "Save Offer" : "Add Offer"}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setTitle(""); setDescription(""); setStartDate(""); setEndDate(""); setImage(""); setTerms(""); }} className="px-4 py-3 border border-[#E2E2DF] text-[#666666] hover:bg-white text-xs font-bold uppercase tracking-wider">
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Offers List */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222]">Offers & Deals ({content.offers.length})</h3>
          {content.offers.length === 0 ? (
            <p className="text-xs text-[#666666] italic py-8 border border-dashed border-[#E2E2DF] text-center bg-[#F8F8F6]">No offers created yet.</p>
          ) : (
            <div className="space-y-4">
              {content.offers.map((o) => (
                <div key={o.id} className={`border p-4 bg-white transition-all flex flex-col sm:flex-row justify-between gap-4 ${o.enabled ? 'border-[#E2E2DF]' : 'border-dashed border-gray-300 opacity-60'}`}>
                  <div className="flex gap-4 items-start">
                    {o.image && (
                      <img src={o.image} alt={o.title} className="w-16 h-16 object-contain border border-[#E2E2DF] bg-[#F8F8F6] p-1 flex-shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#F8F8F6] text-[#8A6A44] text-[8px] font-bold uppercase tracking-wider border border-[#E2E2DF]">{o.type}</span>
                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 ${o.enabled ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          {o.enabled ? "Active" : "Disabled"}
                        </span>
                      </div>
                      <h4 className="font-bold text-[#222222] text-sm mt-1.5">{o.title}</h4>
                      <p className="text-xs text-[#666666] mt-1 line-clamp-2">{o.description}</p>
                      {o.terms && <p className="text-[9px] text-[#8A6A44] font-semibold mt-1">T&C: {o.terms}</p>}
                      {(o.startDate || o.endDate) && (
                        <p className="text-[8px] text-[#999999] mt-1 font-semibold uppercase">
                          Validity: {o.startDate || "Anytime"} &rarr; {o.endDate || "Forever"}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center justify-end gap-2 flex-shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <button type="button" onClick={() => toggleEnable(o.id)} className="w-full text-center py-1 px-3 border border-[#E2E2DF] hover:border-[#7A2E2E] text-[9px] font-bold uppercase tracking-wider transition-colors">
                      {o.enabled ? "Disable" : "Enable"}
                    </button>
                    <button type="button" onClick={() => startEdit(o)} className="w-full text-center py-1 px-3 border border-[#E2E2DF] hover:border-[#8A6A44] text-[9px] font-bold uppercase tracking-wider transition-colors">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(o.id)} className="w-full text-center py-1 px-3 border border-[#E2E2DF] hover:border-red-600 text-[#7A2E2E] text-[9px] font-bold uppercase tracking-wider transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB — Gallery (Upload Shop/Event/Product photos, Categorize, Reorder)
// ─────────────────────────────────────────────────────────────────────────────
function GalleryTab({
  content,
  setContent,
  token,
}: {
  content: SiteContent;
  setContent: React.Dispatch<React.SetStateAction<SiteContent>>;
  token: string;
}) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState<"Store Interior" | "Store Exterior" | "Product Displays" | "Customer Moments" | "Events">("Store Interior");

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    const result = await saveSiteContentApi(content, token);
    setSaving(false);
    if (result.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setSaveError(result.error ?? "Save failed.");
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      alert("Please upload a photo first.");
      return;
    }
    const newItem: GalleryItem = {
      id: `gal-${Date.now()}`,
      imageUrl,
      category,
      sortOrder: content.gallery.length + 1
    };
    setContent(c => ({
      ...c,
      gallery: [...c.gallery, newItem]
    }));
    setImageUrl("");
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Remove this photo from the shop gallery?")) return;
    setContent(c => ({ ...c, gallery: c.gallery.filter(g => g.id !== id) }));
  };

  const moveOrder = (index: number, direction: "up" | "down") => {
    const list = [...content.gallery];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    // Swap items
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    // Recalculate sortOrder
    const updated = list.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    setContent(c => ({ ...c, gallery: updated }));
  };

  const sortedGallery = [...content.gallery].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <SaveBar onSave={handleSave} saved={saved} saving={saving} />
      {saveError && (
        <div className="mx-6 mt-3 flex items-center gap-2 text-[#7A2E2E] bg-[#7A2E2E]/5 border border-[#7A2E2E]/20 px-3 py-2">
          <AlertCircle size={13} />
          <span className="text-xs font-semibold">{saveError}</span>
        </div>
      )}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form */}
        <form onSubmit={handleAdd} className="lg:col-span-5 bg-[#F8F8F6] border border-[#E2E2DF] p-6 space-y-4 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222] border-b border-[#E2E2DF] pb-3 flex items-center gap-2">
            <Plus size={14} /> Upload Shop Photo
          </h3>
          <div>
            <FieldLabel>Photo Category *</FieldLabel>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-white border border-[#E2E2DF] px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A2E2E]"
            >
              <option value="Store Interior">Store Interior</option>
              <option value="Store Exterior">Store Exterior</option>
              <option value="Product Displays">Product Displays</option>
              <option value="Customer Moments">Customer Moments</option>
              <option value="Events">Events</option>
            </select>
          </div>
          <div>
            <ImageUploader label="Upload Image directly from computer *" value={imageUrl} onChange={setImageUrl} aspectHint="landscape" />
          </div>
          <button type="submit" className="w-full py-3 bg-[#7A2E2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5F2222] transition-colors cursor-pointer">
            Add to Gallery
          </button>
        </form>

        {/* Gallery List */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222]">Gallery Photos ({sortedGallery.length})</h3>
          {sortedGallery.length === 0 ? (
            <p className="text-xs text-[#666666] italic py-8 border border-dashed border-[#E2E2DF] text-center bg-[#F8F8F6]">No gallery items uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {sortedGallery.map((g, idx) => (
                <div key={g.id} className="border border-[#E2E2DF] bg-white p-2 relative flex flex-col justify-between">
                  <div className="aspect-video w-full overflow-hidden bg-[#F8F8F6] border border-[#E2E2DF] mb-2 relative">
                    <img src={g.imageUrl} alt="Gallery item" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[7px] uppercase tracking-wide px-1 py-0.5">{g.category}</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[8px] text-[#8A6A44] font-bold font-mono">Pos: {g.sortOrder}</span>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => moveOrder(idx, "up")} disabled={idx === 0} className="p-1 border border-[#E2E2DF] disabled:opacity-20 hover:border-[#7A2E2E]">
                        <ArrowUp size={8} />
                      </button>
                      <button type="button" onClick={() => moveOrder(idx, "down")} disabled={idx === sortedGallery.length - 1} className="p-1 border border-[#E2E2DF] disabled:opacity-20 hover:border-[#7A2E2E]">
                        <ArrowDown size={8} />
                      </button>
                      <button type="button" onClick={() => handleDelete(g.id)} className="p-1 border border-[#E2E2DF] text-[#7A2E2E] hover:border-[#7A2E2E] hover:bg-[#7A2E2E]/10">
                        <Trash2 size={8} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB — Products (Manage Catalog, Multiple Images, dynamic Category dropdown)
// ─────────────────────────────────────────────────────────────────────────────
interface ProductsTabProps {
  categories: Category[];
  token: string;
}

function ProductsTab({ categories, token }: ProductsTabProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [featured, setFeatured] = useState(false);
  const [newArrival, setNewArrival] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);
  const [stockStatus, setStockStatus] = useState("In Stock");
  const [warranty, setWarranty] = useState("");
  const [emiAvailable, setEmiAvailable] = useState(false);
  const [freeGift, setFreeGift] = useState("");
  const [comboOffer, setComboOffer] = useState("");
  const [cashbackOffer, setCashbackOffer] = useState("");
  const [offersAndPromotions, setOffersAndPromotions] = useState("");
  const [isAccessoryOnly, setIsAccessoryOnly] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const refreshProducts = useCallback(async () => {
    const list = await fetchProducts();
    setProducts(list);
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  // Set default category when categories list loads
  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !brand || !description || !category) {
      alert("Name, Brand, Description, and Category are required.");
      return;
    }

    const specsArray = specifications.split(",").map((s) => s.trim()).filter(Boolean);
    const validImages = images.filter(Boolean);

    const productData: Product = {
      id: editingId || `prod-${Date.now()}`,
      name,
      brand,
      category,
      description,
      images: validImages,
      specifications: specsArray,
      originalPrice,
      discountPrice: discountPrice || undefined,
      discountPercentage: discountPercentage || undefined,
      featured,
      newArrival,
      bestSeller,
      stockStatus,
      warranty: warranty || undefined,
      emiAvailable,
      freeGift: freeGift || undefined,
      comboOffer: comboOffer || undefined,
      cashbackOffer: cashbackOffer || undefined,
      offersAndPromotions: offersAndPromotions || undefined,
      isAccessoryPageOnly: isAccessoryOnly,
    };

    let updated: Product[];
    if (editingId) {
      updated = products.map((p) => (p.id === editingId ? productData : p));
    } else {
      updated = [productData, ...products];
    }

    setProducts(updated);
    setSaving(true);
    setSaveError("");
    const result = await saveProductsApi(updated, token);
    setSaving(false);

    if (result.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      resetForm();
    } else {
      setSaveError(result.error ?? "Failed to save product to server.");
      refreshProducts();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setBrand("");
    setCategory(categories[0]?.name || "");
    setDescription("");
    setImages([]);
    setSpecifications("");
    setOriginalPrice("");
    setDiscountPrice("");
    setDiscountPercentage("");
    setFeatured(false);
    setNewArrival(false);
    setBestSeller(false);
    setStockStatus("In Stock");
    setWarranty("");
    setEmiAvailable(false);
    setFreeGift("");
    setComboOffer("");
    setCashbackOffer("");
    setOffersAndPromotions("");
    setIsAccessoryOnly(false);
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setBrand(p.brand);
    setCategory(p.category);
    setDescription(p.description);
    setImages(p.images || []);
    setSpecifications(p.specifications.join(", "));
    setOriginalPrice(p.originalPrice);
    setDiscountPrice(p.discountPrice || "");
    setDiscountPercentage(p.discountPercentage || "");
    setFeatured(p.featured);
    setNewArrival(p.newArrival);
    setBestSeller(p.bestSeller);
    setStockStatus(p.stockStatus);
    setWarranty(p.warranty || "");
    setEmiAvailable(p.emiAvailable);
    setFreeGift(p.freeGift || "");
    setComboOffer(p.comboOffer || "");
    setCashbackOffer(p.cashbackOffer || "");
    setOffersAndPromotions(p.offersAndPromotions || "");
    setIsAccessoryOnly(!!p.isAccessoryPageOnly);
  };

  const handleDelete = async (id: string, label: string) => {
    if (!window.confirm(`Remove "${label}" from inventory?`)) return;
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);

    setSaving(true);
    setSaveError("");
    const result = await saveProductsApi(updated, token);
    setSaving(false);

    if (result.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      if (editingId === id) resetForm();
    } else {
      setSaveError(result.error ?? "Failed to delete product from server.");
      refreshProducts();
    }
  };

  return (
    <div>
      <div className="sticky top-0 z-10 bg-white border-b border-[#E2E2DF] px-6 py-3 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#666666]">
          Products — {products.length} items
        </span>
        <div className="flex gap-3">
          {saving && (
            <span className="text-xs font-semibold text-[#8A6A44] flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" /> Saving…
            </span>
          )}
          {saved && (
            <span className="text-xs font-semibold text-green-700 flex items-center gap-1">
              <CheckCircle size={12} /> Saved!
            </span>
          )}
        </div>
      </div>

      {saveError && (
        <div className="mx-6 mt-3 flex items-center gap-2 text-[#7A2E2E] bg-[#7A2E2E]/5 border border-[#7A2E2E]/20 px-3 py-2">
          <AlertCircle size={13} />
          <span className="text-xs font-semibold">{saveError}</span>
        </div>
      )}

      <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Add/Edit Form */}
        <form onSubmit={handleAddOrEdit} className="xl:col-span-6 bg-[#F8F8F6] border border-[#E2E2DF] p-6 space-y-4 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222] flex items-center gap-2 border-b border-[#E2E2DF] pb-3 mb-1">
            <Plus size={14} /> {editingId ? `Edit Product: ${name}` : "Add New Product"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Product Name *</FieldLabel>
              <FieldInput value={name} onChange={setName} placeholder="e.g. Galaxy S24 Ultra" required />
            </div>
            <div>
              <FieldLabel>Brand *</FieldLabel>
              <FieldInput value={brand} onChange={setBrand} placeholder="e.g. Samsung" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Category *</FieldLabel>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-[#E2E2DF] px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A2E2E] h-[40px]"
                required
              >
                {categories.length === 0 ? (
                  <option value="">No categories defined</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <FieldLabel>Stock Status *</FieldLabel>
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value)}
                className="w-full bg-white border border-[#E2E2DF] px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A2E2E] h-[40px]"
              >
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Limited Stock">Limited Stock</option>
                <option value="Available on Order">Available on Order</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <FieldLabel>Original Price *</FieldLabel>
              <FieldInput value={originalPrice} onChange={setOriginalPrice} placeholder="e.g. ₹1,29,999" required />
            </div>
            <div>
              <FieldLabel>Discount Price (optional)</FieldLabel>
              <FieldInput value={discountPrice} onChange={setDiscountPrice} placeholder="e.g. ₹1,19,999" />
            </div>
            <div>
              <FieldLabel>Discount Percentage (optional)</FieldLabel>
              <FieldInput value={discountPercentage} onChange={setDiscountPercentage} placeholder="e.g. 7%" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Warranty (optional)</FieldLabel>
              <FieldInput value={warranty} onChange={setWarranty} placeholder="e.g. 1 Year Brand Warranty" />
            </div>
            <div>
              <FieldLabel>Free Gift Offer (optional)</FieldLabel>
              <FieldInput value={freeGift} onChange={setFreeGift} placeholder="e.g. Free 25W Fast Adapter" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <FieldLabel>Combo Offer (optional)</FieldLabel>
              <FieldInput value={comboOffer} onChange={setComboOffer} placeholder="e.g. Combo Case + Screen Protector" />
            </div>
            <div>
              <FieldLabel>Cashback Offer (optional)</FieldLabel>
              <FieldInput value={cashbackOffer} onChange={setCashbackOffer} placeholder="e.g. ₹5000 instant cashback on cards" />
            </div>
            <div>
              <FieldLabel>Other Promos/Details (optional)</FieldLabel>
              <FieldInput value={offersAndPromotions} onChange={setOffersAndPromotions} placeholder="e.g. Festival Special Offer" />
            </div>
          </div>

          <div>
            <FieldLabel>Description *</FieldLabel>
            <FieldTextarea value={description} onChange={setDescription} placeholder="Enter premium product description..." rows={3} />
          </div>

          <div>
            <FieldLabel>Specifications (comma-separated)</FieldLabel>
            <FieldInput value={specifications} onChange={setSpecifications} placeholder="e.g. 200MP Camera, Snapdragon 8 Gen 3, 5000mAh Battery" />
          </div>

          {/* Badges / Checkboxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 border border-[#E2E2DF]">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded border-[#E2E2DF]" />
              <span className="text-[10px] text-[#666666] font-bold uppercase tracking-wider">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={newArrival} onChange={(e) => setNewArrival(e.target.checked)} className="rounded border-[#E2E2DF]" />
              <span className="text-[10px] text-[#666666] font-bold uppercase tracking-wider">New Arrival</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={bestSeller} onChange={(e) => setBestSeller(e.target.checked)} className="rounded border-[#E2E2DF]" />
              <span className="text-[10px] text-[#666666] font-bold uppercase tracking-wider">Best Seller</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={emiAvailable} onChange={(e) => setEmiAvailable(e.target.checked)} className="rounded border-[#E2E2DF]" />
              <span className="text-[10px] text-[#666666] font-bold uppercase tracking-wider">EMI Available</span>
            </label>
          </div>

          {category === "Accessories" && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={isAccessoryOnly} onChange={(e) => setIsAccessoryOnly(e.target.checked)} className="rounded border-[#E2E2DF]" />
              <span className="text-xs text-[#666666] font-semibold">Show only on Accessories catalog page</span>
            </label>
          )}

          {/* Multiple Image Uploader Slots */}
          <div className="space-y-3">
            <FieldLabel>Product Images (Upload directly from device)</FieldLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map((imgUrl, index) => (
                <div key={index} className="relative group border border-[#E2E2DF] p-2 bg-white">
                  <ImageUploader
                    label={`Image ${index + 1}`}
                    value={imgUrl}
                    onChange={(newUrl) => {
                      const updated = [...images];
                      updated[index] = newUrl;
                      setImages(updated);
                    }}
                    aspectHint="square"
                  />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, idx) => idx !== index))}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-800 text-white rounded-full p-1 flex items-center justify-center transition-colors"
                    title="Delete image slot"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setImages([...images, ""])}
                className="border-2 border-dashed border-[#E2E2DF] hover:border-[#7A2E2E] flex flex-col items-center justify-center p-4 min-h-[160px] text-[#666666] hover:text-[#7A2E2E] transition-colors"
              >
                <Plus size={18} className="text-[#8A6A44]" />
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Add Image Slot</span>
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-[#7A2E2E] hover:bg-[#5F2222] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer">
              {saving ? "Saving..." : editingId ? "Update Product" : "Publish Product"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-4 py-3 border border-[#E2E2DF] text-[#666666] hover:bg-white text-xs font-bold uppercase tracking-wider">
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {/* Products Table List */}
        <div className="xl:col-span-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222] mb-4">Inventory Catalogue</h3>
          <div className="border border-[#E2E2DF] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F8F6] border-b border-[#E2E2DF] text-[#222222] uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3">Item</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E2DF]">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-xs text-[#666666] italic bg-white">
                      No products added to catalogue yet.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const firstImage = p.images?.[0] || "";
                    return (
                      <tr key={p.id} className="hover:bg-[#F8F8F6]/50 transition-colors">
                        <td className="p-3 flex items-center gap-3">
                          {firstImage ? (
                            <img src={firstImage} alt={p.name} className="w-10 h-10 object-contain border border-[#E2E2DF] bg-white p-1" />
                          ) : (
                            <div className="w-10 h-10 border border-[#E2E2DF] bg-[#F8F8F6] flex items-center justify-center text-[#AAAAAA]">
                              <Package size={14} />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-[#222222] flex items-center gap-1.5">
                              {p.name}
                              {p.featured && <span className="bg-amber-100 text-amber-800 text-[6px] font-bold uppercase px-1 border border-amber-200">Featured</span>}
                            </div>
                            <div className="text-[#8A6A44] text-[9px] uppercase font-semibold">{p.brand}</div>
                          </div>
                        </td>
                        <td className="p-3 text-[#666666]">{p.category}</td>
                        <td className="p-3 text-right">
                          <span className="font-semibold text-[#7A2E2E]">{p.discountPrice || p.originalPrice}</span>
                          {p.discountPrice && <div className="text-[8px] line-through text-[#999999]">{p.originalPrice}</div>}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => startEdit(p)}
                              className="p-1 border border-[#E2E2DF] hover:border-[#8A6A44] hover:text-[#8A6A44] transition-colors"
                              title="Edit product"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              disabled={saving}
                              className="p-1 border border-[#E2E2DF] text-[#7A2E2E] hover:bg-[#7A2E2E]/10 transition-colors disabled:opacity-50"
                              title="Delete product"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 bg-[#F8F8F6] border border-[#E2E2DF] p-3 flex gap-2 text-[#8A6A44]">
            <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
            <p className="text-[9px] leading-relaxed">
              Maa Radio products are stored securely in Supabase Database. Changes made in this panel are immediately live.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB NAVIGATION CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: "business", label: "Business Details", Icon: Building2 },
  { id: "categories", label: "Categories", Icon: Layers },
  { id: "offers", label: "Offers & Deals", Icon: Tag },
  { id: "gallery", label: "Shop Gallery", Icon: Image },
  { id: "products", label: "Products Catalog", Icon: Package },
];

// ─────────────────────────────────────────────────────────────────────────────
// ROOT ADMIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("business");
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [token, setToken] = useState("");

  const supabase = createClient();

  // Restore session from Supabase on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setToken(session.access_token);
        setIsAuthenticated(true);
        fetchSiteContent().then(setContent);
      } else {
        const saved = sessionStorage.getItem("admin_token");
        if (saved) {
          const { data: { user } } = await supabase.auth.getUser(saved);
          if (user) {
            setToken(saved);
            setIsAuthenticated(true);
            fetchSiteContent().then(setContent);
            return;
          }
        }
        setIsAuthenticated(false);
      }
    };
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setLoginError(error.message);
      } else if (data.session) {
        sessionStorage.setItem("admin_token", data.session.access_token);
        setToken(data.session.access_token);
        setIsAuthenticated(true);
        fetchSiteContent().then(setContent);
      } else {
        setLoginError("Could not retrieve login session.");
      }
    } catch {
      setLoginError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem("admin_token");
    setToken("");
    setIsAuthenticated(false);
    setEmail("");
    setPassword("");
  };

  // ── LOGIN SCREEN ─────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] flex items-center justify-center px-4 pt-24 pb-20">
        <div className="w-full max-w-sm bg-white border border-[#E2E2DF] p-8 md:p-10 flex flex-col items-center">
          <div className="w-14 h-14 bg-[#F8F8F6] border border-[#E2E2DF] flex items-center justify-center text-[#7A2E2E] mb-6">
            <Lock size={22} />
          </div>
          <h1 className="text-xl font-extrabold text-[#222222] tracking-tight mb-1">
            Maa Radio Admin
          </h1>
          <p className="text-xs text-[#666666] text-center mb-8 leading-relaxed">
            This panel is restricted to the store owner.<br />
            Sign in with your admin credentials to continue.
          </p>

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div>
              <FieldLabel>Admin Email</FieldLabel>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@maaradio.in"
                required
                className="w-full bg-[#F8F8F6] border border-[#E2E2DF] px-4 py-3 text-sm text-[#222222] focus:outline-none focus:border-[#7A2E2E]"
              />
            </div>
            <div>
              <FieldLabel>Admin Password</FieldLabel>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#F8F8F6] border border-[#E2E2DF] px-4 py-3 text-sm text-[#222222] focus:outline-none focus:border-[#7A2E2E]"
              />
            </div>

            {loginError && (
              <div className="flex items-center gap-2 text-[#7A2E2E] bg-[#7A2E2E]/5 border border-[#7A2E2E]/20 px-3 py-2">
                <AlertCircle size={13} />
                <span className="text-xs font-semibold">{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#7A2E2E] hover:bg-[#5F2222] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              {isLoading ? "Verifying..." : "Access Dashboard"}
            </button>
          </form>

          <p className="text-[9px] text-[#AAAAAA] mt-8 text-center leading-relaxed">
            Admin accounts are managed securely via Supabase Auth.<br />
            Create users in Authentication &rarr; Users in your Supabase Dashboard.
          </p>
        </div>
      </div>
    );
  }

  // ── AUTHENTICATED DASHBOARD ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Dashboard Header */}
      <div className="border-b border-[#E2E2DF] px-6 md:px-12 py-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <Sparkles size={16} className="text-[#7A2E2E]" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#222222]">
              Maa Radio Owner Dashboard
            </span>
            <span className="text-[9px] text-[#8A6A44] ml-3 uppercase tracking-widest font-semibold">
              Authenticated
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#666666] hover:text-[#7A2E2E] transition-colors border border-[#E2E2DF] hover:border-[#7A2E2E] px-3 py-1.5 cursor-pointer"
        >
          <LogOut size={13} />
          Log Out
        </button>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-120px)]">
        {/* Sidebar Navigation */}
        <nav className="lg:w-52 bg-[#F8F8F6] border-b lg:border-b-0 lg:border-r border-[#E2E2DF] p-4 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible flex-shrink-0">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === id
                  ? "bg-[#7A2E2E] text-white"
                  : "text-[#666666] hover:bg-white hover:text-[#222222]"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === "business" && <BusinessTab content={content} setContent={setContent} token={token} />}
          {activeTab === "categories" && <CategoriesTab content={content} setContent={setContent} token={token} />}
          {activeTab === "offers" && <OffersTab content={content} setContent={setContent} token={token} />}
          {activeTab === "gallery" && <GalleryTab content={content} setContent={setContent} token={token} />}
          {activeTab === "products" && <ProductsTab categories={content.categories} token={token} />}
        </main>
      </div>
    </div>
  );
}
