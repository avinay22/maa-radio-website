"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Lock, LogOut, Save, Plus, Trash2, ShieldAlert, Sparkles,
  Building2, Home, Star, Image, Package, Users, CheckCircle, AlertCircle, Loader2,
} from "lucide-react";
import {
  SiteContent, WhyCard, Review,
  DEFAULT_SITE_CONTENT,
} from "@/data/siteContent";
import { Product, INITIAL_PRODUCTS } from "@/data/products";
import ImageUploader from "@/components/ImageUploader";
import {
  fetchSiteContent, saveSiteContentApi,
  fetchProducts, saveProductsApi,
} from "@/lib/apiClient";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type Tab =
  | "business"
  | "homepage"
  | "brands"
  | "reviews"
  | "gallery"
  | "products";

// ─────────────────────────────────────────────────────────────────────────────
// SMALL HELPERS
// ─────────────────────────────────────────────────────────────────────────────
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
        className="inline-flex items-center gap-2 px-5 py-2 bg-[#7A2E2E] hover:bg-[#5F2222] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider transition-colors"
      >
        {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? <CheckCircle size={13} /> : <Save size={13} />}
        {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB — Business Info
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <FieldLabel>Business Name</FieldLabel>
            <FieldInput value={content.businessName} onChange={f("businessName")} placeholder="Maa Radio" />
          </div>
          <div>
            <FieldLabel>Owner Name</FieldLabel>
            <FieldInput value={content.ownerName} onChange={f("ownerName")} placeholder="Madan Ghosh" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <FieldLabel>Phone Number</FieldLabel>
            <FieldInput value={content.phone} onChange={f("phone")} placeholder="+91 70027 33658" />
          </div>
          <div>
            <FieldLabel>WhatsApp Number (digits only)</FieldLabel>
            <FieldInput value={content.whatsapp} onChange={f("whatsapp")} placeholder="917002733658" />
          </div>
        </div>
        <div>
          <FieldLabel>Store Address</FieldLabel>
          <FieldTextarea value={content.address} onChange={f("address")} rows={2} />
        </div>
        <div>
          <FieldLabel>Business Hours</FieldLabel>
          <FieldInput value={content.hours} onChange={f("hours")} placeholder="Mon - Sat: 10:00 AM – 8:30 PM" />
        </div>
        <div>
          <FieldLabel>Footer Tagline</FieldLabel>
          <FieldTextarea value={content.footerTagline} onChange={f("footerTagline")} rows={3} />
        </div>
        <div>
          <FieldLabel>Google Maps Embed URL</FieldLabel>
          <FieldTextarea value={content.mapsEmbedUrl} onChange={f("mapsEmbedUrl")} rows={3} placeholder="Paste Google Maps embed src URL here" />
          <p className="text-[9px] text-[#8A6A44] mt-1">
            In Google Maps → Share → Embed a map → copy the src="" value only.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB — Homepage Content
// ─────────────────────────────────────────────────────────────────────────────
function HomepageTab({
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

  const updateWhyCard = (idx: number, field: keyof WhyCard, val: string) => {
    setContent((c) => {
      const cards = [...c.whyCards];
      cards[idx] = { ...cards[idx], [field]: val };
      return { ...c, whyCards: cards };
    });
  };

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
      <div className="p-6 space-y-8 max-w-2xl">

        {/* Hero */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222] border-b border-[#E2E2DF] pb-2">
            Hero Section
          </h3>
          <div>
            <FieldLabel>Badge Text</FieldLabel>
            <FieldInput value={content.heroBadge} onChange={f("heroBadge")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Heading (first line)</FieldLabel>
              <FieldInput value={content.heroHeading} onChange={f("heroHeading")} />
            </div>
            <div>
              <FieldLabel>Heading Accent (burgundy)</FieldLabel>
              <FieldInput value={content.heroHeadingAccent} onChange={f("heroHeadingAccent")} />
            </div>
          </div>
          <div>
            <FieldLabel>Body Text</FieldLabel>
            <FieldTextarea value={content.heroBody} onChange={f("heroBody")} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Primary CTA Button</FieldLabel>
              <FieldInput value={content.heroCTAPrimary} onChange={f("heroCTAPrimary")} />
            </div>
            <div>
              <FieldLabel>Secondary CTA Button</FieldLabel>
              <FieldInput value={content.heroCTASecondary} onChange={f("heroCTASecondary")} />
            </div>
          </div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8A6A44] mt-2">
            Featured Product Card (right side of hero)
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Product Name</FieldLabel>
              <FieldInput value={content.heroProductName} onChange={f("heroProductName")} />
            </div>
            <div>
              <FieldLabel>Product Price</FieldLabel>
              <FieldInput value={content.heroProductPrice} onChange={f("heroProductPrice")} />
            </div>
          </div>
          <div>
            <FieldLabel>Product Variant / Sub-label</FieldLabel>
            <FieldInput value={content.heroProductVariant} onChange={f("heroProductVariant")} />
          </div>
          <ImageUploader
            label="Hero Featured Product Image"
            value={content.heroProductImage}
            onChange={f("heroProductImage")}
            aspectHint="portrait"
          />
        </section>

        {/* Philosophy */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222] border-b border-[#E2E2DF] pb-2">
            Philosophy Section
          </h3>
          <div>
            <FieldLabel>Label</FieldLabel>
            <FieldInput value={content.philosophyLabel} onChange={f("philosophyLabel")} />
          </div>
          <div>
            <FieldLabel>Quote (supports &lt;strong&gt; for bold)</FieldLabel>
            <FieldTextarea value={content.philosophyQuote} onChange={f("philosophyQuote")} rows={4} />
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222] border-b border-[#E2E2DF] pb-2">
            Why Choose Us
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Section Label</FieldLabel>
              <FieldInput value={content.whyLabel} onChange={f("whyLabel")} />
            </div>
            <div>
              <FieldLabel>Section Heading</FieldLabel>
              <FieldInput value={content.whyHeading} onChange={f("whyHeading")} />
            </div>
          </div>
          <div>
            <FieldLabel>Section Description (optional)</FieldLabel>
            <FieldTextarea value={content.whyDescription || ""} onChange={f("whyDescription")} rows={2} />
          </div>
          {content.whyCards.map((card, idx) => (
            <div key={idx} className="bg-[#F8F8F6] border border-[#E2E2DF] p-4 space-y-3">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8A6A44]">
                Card {idx + 1}
              </span>
              <div>
                <FieldLabel>Title</FieldLabel>
                <FieldInput
                  value={card.title}
                  onChange={(v) => updateWhyCard(idx, "title", v)}
                />
              </div>
              <div>
                <FieldLabel>Description</FieldLabel>
                <FieldTextarea
                  value={card.description}
                  onChange={(v) => updateWhyCard(idx, "description", v)}
                  rows={2}
                />
              </div>
            </div>
          ))}
        </section>

        {/* Contact CTA */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222] border-b border-[#E2E2DF] pb-2">
            Contact CTA Section (bottom of home page)
          </h3>
          <div>
            <FieldLabel>Section Label</FieldLabel>
            <FieldInput value={content.contactCtaLabel} onChange={f("contactCtaLabel")} />
          </div>
          <div>
            <FieldLabel>Heading</FieldLabel>
            <FieldInput value={content.contactCtaHeading} onChange={f("contactCtaHeading")} />
          </div>
          <div>
            <FieldLabel>Body Text</FieldLabel>
            <FieldTextarea value={content.contactCtaBody} onChange={f("contactCtaBody")} rows={3} />
          </div>
        </section>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB — Brands
// ─────────────────────────────────────────────────────────────────────────────
function BrandsTab({
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
  const [newBrand, setNewBrand] = useState("");

  const addBrand = () => {
    const trimmed = newBrand.trim();
    if (!trimmed || content.brands.includes(trimmed)) return;
    setContent((c) => ({ ...c, brands: [...c.brands, trimmed] }));
    setNewBrand("");
  };

  const removeBrand = (name: string) =>
    setContent((c) => ({ ...c, brands: c.brands.filter((b) => b !== name) }));

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
      <div className="p-6 max-w-xl space-y-6">
        <div>
          <FieldLabel>Brands Section Label</FieldLabel>
          <FieldInput
            value={content.brandsLabel}
            onChange={(v) => setContent((c) => ({ ...c, brandsLabel: v }))}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel>Add Brand</FieldLabel>
          <div className="flex gap-2">
            <input
              type="text"
              value={newBrand}
              onChange={(e) => setNewBrand(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addBrand()}
              placeholder="e.g. Sony"
              className="flex-1 bg-white border border-[#E2E2DF] px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A2E2E]"
            />
            <button
              type="button"
              onClick={addBrand}
              className="px-4 bg-[#7A2E2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5F2222] transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {content.brands.map((brand) => (
            <div
              key={brand}
              className="flex items-center gap-2 bg-[#F8F8F6] border border-[#E2E2DF] px-3 py-1.5"
            >
              <span className="text-sm font-semibold text-[#222222]">{brand}</span>
              <button
                type="button"
                onClick={() => removeBrand(brand)}
                className="text-[#666666] hover:text-[#7A2E2E] transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB — Reviews
// ─────────────────────────────────────────────────────────────────────────────
function ReviewsTab({
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
  const [newQuote, setNewQuote] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const addReview = () => {
    if (!newQuote.trim() || !newAuthor.trim()) return;
    const rev: Review = {
      id: `r-${Date.now()}`,
      quote: newQuote.trim(),
      author: newAuthor.trim(),
      location: newLocation.trim(),
    };
    setContent((c) => ({ ...c, reviews: [...c.reviews, rev] }));
    setNewQuote("");
    setNewAuthor("");
    setNewLocation("");
  };

  const removeReview = (id: string) =>
    setContent((c) => ({ ...c, reviews: c.reviews.filter((r) => r.id !== id) }));

  const updateReview = (id: string, field: keyof Review, val: string) =>
    setContent((c) => ({
      ...c,
      reviews: c.reviews.map((r) => (r.id === id ? { ...r, [field]: val } : r)),
    }));

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
      <div className="p-6 max-w-2xl space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Section Label</FieldLabel>
            <FieldInput value={content.reviewsLabel} onChange={(v) => setContent((c) => ({ ...c, reviewsLabel: v }))} />
          </div>
          <div>
            <FieldLabel>Section Heading</FieldLabel>
            <FieldInput value={content.reviewsHeading} onChange={(v) => setContent((c) => ({ ...c, reviewsHeading: v }))} />
          </div>
        </div>

        {/* Existing reviews */}
        <div className="space-y-4">
          {content.reviews.map((rev) => (
            <div key={rev.id} className="bg-[#F8F8F6] border border-[#E2E2DF] p-4 space-y-3">
              <div>
                <FieldLabel>Review Quote</FieldLabel>
                <FieldTextarea value={rev.quote} onChange={(v) => updateReview(rev.id, "quote", v)} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Customer Name</FieldLabel>
                  <FieldInput value={rev.author} onChange={(v) => updateReview(rev.id, "author", v)} />
                </div>
                <div>
                  <FieldLabel>Location</FieldLabel>
                  <FieldInput value={rev.location} onChange={(v) => updateReview(rev.id, "location", v)} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeReview(rev.id)}
                className="text-[10px] font-bold uppercase tracking-wider text-[#7A2E2E] hover:underline flex items-center gap-1"
              >
                <Trash2 size={11} /> Remove Review
              </button>
            </div>
          ))}
        </div>

        {/* Add new review */}
        <div className="border border-dashed border-[#E2E2DF] p-5 space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A6A44]">
            Add New Review
          </span>
          <div>
            <FieldLabel>Quote</FieldLabel>
            <FieldTextarea value={newQuote} onChange={setNewQuote} placeholder="Customer's review text..." rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Customer Name</FieldLabel>
              <FieldInput value={newAuthor} onChange={setNewAuthor} placeholder="e.g. Arnab Saikia" />
            </div>
            <div>
              <FieldLabel>Location</FieldLabel>
              <FieldInput value={newLocation} onChange={setNewLocation} placeholder="e.g. Gogamukh" />
            </div>
          </div>
          <button
            type="button"
            onClick={addReview}
            className="px-5 py-2 bg-[#7A2E2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5F2222] transition-colors flex items-center gap-2"
          >
            <Plus size={13} /> Add Review
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB — Gallery
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

  const updateImage = (idx: number, val: string) =>
    setContent((c) => {
      const g = [...c.gallery];
      g[idx] = val;
      return { ...c, gallery: g };
    });

  const removeImage = (idx: number) =>
    setContent((c) => ({
      ...c,
      gallery: c.gallery.filter((_, i) => i !== idx),
    }));

  const addSlot = () =>
    setContent((c) => ({ ...c, gallery: [...c.gallery, ""] }));

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
      <div className="p-6 space-y-6 max-w-3xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Section Label</FieldLabel>
            <FieldInput value={content.galleryLabel} onChange={(v) => setContent((c) => ({ ...c, galleryLabel: v }))} />
          </div>
          <div>
            <FieldLabel>Section Heading</FieldLabel>
            <FieldInput value={content.galleryHeading} onChange={(v) => setContent((c) => ({ ...c, galleryHeading: v }))} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {content.gallery.map((img, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#666666]">
                  Gallery Image {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="text-[9px] font-bold uppercase text-[#7A2E2E] hover:underline flex items-center gap-1"
                >
                  <Trash2 size={10} /> Remove
                </button>
              </div>
              <ImageUploader
                label=""
                value={img}
                onChange={(v) => updateImage(idx, v)}
                aspectHint="square"
                maxSizeMB={2}
              />
            </div>
          ))}

          {/* Add new slot */}
          <button
            type="button"
            onClick={addSlot}
            className="border-2 border-dashed border-[#E2E2DF] hover:border-[#7A2E2E] flex flex-col items-center justify-center gap-2 p-8 text-center transition-colors min-h-[160px]"
          >
            <Plus size={18} className="text-[#8A6A44]" />
            <span className="text-xs font-bold text-[#666666]">Add Gallery Image</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB — Products
// ─────────────────────────────────────────────────────────────────────────────
interface ProductsTabProps {
  token: string;
}

function ProductsTab({ token }: ProductsTabProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState<Product["category"]>("Smartphones");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [isAccessoryOnly, setIsAccessoryOnly] = useState(false);
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !brand || !description) {
      alert("Please fill in all required fields.");
      return;
    }
    const specsArray = specifications.split(",").map((s) => s.trim()).filter(Boolean);
    const newProduct: Product = {
      id: `custom-${Date.now()}`,
      name,
      brand,
      category,
      price: price || undefined,
      image,
      description,
      isAccessoryPageOnly: isAccessoryOnly,
      specifications: specsArray.length > 0 ? specsArray : ["Authentic Product"],
    };
    const updated = [newProduct, ...products];
    setProducts(updated);

    setSaving(true);
    setSaveError("");
    const result = await saveProductsApi(updated, token);
    setSaving(false);

    if (result.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      setName(""); setBrand(""); setPrice(""); setImage("");
      setDescription(""); setSpecifications(""); setIsAccessoryOnly(false);
    } else {
      setSaveError(result.error ?? "Failed to save product to server.");
      // Rollback UI state
      refreshProducts();
    }
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
    } else {
      setSaveError(result.error ?? "Failed to delete product from server.");
      refreshProducts();
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset products to the default catalogue? All custom additions will be lost.")) return;
    setProducts(INITIAL_PRODUCTS);

    setSaving(true);
    setSaveError("");
    const result = await saveProductsApi(INITIAL_PRODUCTS, token);
    setSaving(false);

    if (result.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setSaveError(result.error ?? "Failed to reset products on server.");
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
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="px-3 py-1.5 border border-[#E2E2DF] text-[10px] font-bold uppercase tracking-wider text-[#666666] hover:border-[#7A2E2E] hover:text-[#7A2E2E] transition-colors disabled:opacity-50"
          >
            Reset to Default
          </button>
        </div>
      </div>

      {saveError && (
        <div className="mx-6 mt-3 flex items-center gap-2 text-[#7A2E2E] bg-[#7A2E2E]/5 border border-[#7A2E2E]/20 px-3 py-2">
          <AlertCircle size={13} />
          <span className="text-xs font-semibold">{saveError}</span>
        </div>
      )}

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Add Form */}
        <form onSubmit={handleAdd} className="lg:col-span-5 bg-[#F8F8F6] border border-[#E2E2DF] p-6 h-fit space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222] flex items-center gap-2 border-b border-[#E2E2DF] pb-3 mb-1">
            <Plus size={14} /> Add New Product
          </h3>

          <div>
            <FieldLabel>Product Name *</FieldLabel>
            <FieldInput value={name} onChange={setName} placeholder="e.g. iPhone 15 Pro Max" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Brand *</FieldLabel>
              <FieldInput value={brand} onChange={setBrand} placeholder="e.g. Apple" required />
            </div>
            <div>
              <FieldLabel>Price</FieldLabel>
              <FieldInput value={price} onChange={setPrice} placeholder="₹1,48,900" />
            </div>
          </div>
          <div>
            <FieldLabel>Category *</FieldLabel>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Product["category"])}
              className="w-full bg-white border border-[#E2E2DF] px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A2E2E]"
            >
              <option value="Smartphones">Smartphones</option>
              <option value="Accessories">Accessories</option>
              <option value="Audio">Audio</option>
              <option value="Smart Watches">Smart Watches</option>
              <option value="Home Appliances">Home Appliances</option>
            </select>
          </div>

          <ImageUploader
            label="Product Image"
            value={image}
            onChange={setImage}
            aspectHint="landscape"
          />

          <div>
            <FieldLabel>Description *</FieldLabel>
            <FieldTextarea value={description} onChange={setDescription} placeholder="Enter premium product description..." rows={3} />
          </div>
          <div>
            <FieldLabel>Specifications (comma separated)</FieldLabel>
            <FieldInput value={specifications} onChange={setSpecifications} placeholder="e.g. Titanium, A17 Pro, 48MP" />
          </div>
          {category === "Accessories" && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAccessoryOnly}
                onChange={(e) => setIsAccessoryOnly(e.target.checked)}
                className="rounded border-[#E2E2DF]"
              />
              <span className="text-xs text-[#666666]">Show only on Accessories page</span>
            </label>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-[#7A2E2E] hover:bg-[#5F2222] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            {saving ? "Saving..." : "Publish Product"}
          </button>
        </form>

        {/* Products Table */}
        <div className="lg:col-span-7">
          <div className="border border-[#E2E2DF] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F8F6] border-b border-[#E2E2DF] text-[#222222] uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3">Item</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E2DF]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8F8F6]/50 transition-colors">
                    <td className="p-3 flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-10 h-10 object-contain border border-[#E2E2DF] bg-white p-1" />
                      ) : (
                        <div className="w-10 h-10 border border-[#E2E2DF] bg-[#F8F8F6] flex items-center justify-center text-[#AAAAAA]">
                          <Package size={14} />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-[#222222]">{p.name}</div>
                        <div className="text-[#8A6A44] text-[9px] uppercase font-semibold">{p.brand}</div>
                      </div>
                    </td>
                    <td className="p-3 text-[#666666]">{p.category}</td>
                    <td className="p-3 text-right font-semibold text-[#7A2E2E]">{p.price ?? "—"}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        disabled={saving}
                        className="p-1.5 text-[#7A2E2E] hover:bg-[#7A2E2E]/10 rounded-full transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 bg-[#F8F8F6] border border-[#E2E2DF] p-3 flex gap-2 text-[#8A6A44]">
            <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
            <p className="text-[9px] leading-relaxed">
              Products are stored in the server's data folder (`data/products.json`). Changes are live immediately. If deleted or cleared, it falls back to code defaults.
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
  { id: "business", label: "Business", Icon: Building2 },
  { id: "homepage", label: "Homepage", Icon: Home },
  { id: "brands", label: "Brands", Icon: Star },
  { id: "reviews", label: "Reviews", Icon: Users },
  { id: "gallery", label: "Gallery", Icon: Image },
  { id: "products", label: "Products", Icon: Package },
];

// ─────────────────────────────────────────────────────────────────────────────
// ROOT ADMIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("business");
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [token, setToken] = useState("");

  // On mount — check sessionStorage for existing session token
  useEffect(() => {
    const storedToken = sessionStorage.getItem("maa_admin_token");
    if (storedToken) {
      setIsAuthenticated(true);
      setToken(storedToken);
    }
    fetchSiteContent().then(setContent);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        sessionStorage.setItem("maa_admin_token", data.token);
        setToken(data.token);
        setIsAuthenticated(true);
        fetchSiteContent().then(setContent);
      } else {
        setLoginError(data.error ?? "Authentication failed.");
      }
    } catch {
      setLoginError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("maa_admin_token");
    setToken("");
    setIsAuthenticated(false);
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
            Enter your admin password to continue.
          </p>

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div>
              <FieldLabel>Admin Password</FieldLabel>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                className="w-full bg-[#F8F8F6] border border-[#E2E2DF] px-4 py-3 text-sm text-[#222222] focus:outline-none focus:border-[#7A2E2E] text-center tracking-widest"
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
              className="w-full py-3.5 bg-[#7A2E2E] hover:bg-[#5F2222] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              {isLoading ? "Verifying..." : "Access Dashboard"}
            </button>
          </form>

          <p className="text-[9px] text-[#AAAAAA] mt-8 text-center">
            Session ends when you close this browser tab.
            <br />
            To change the password, update the .env.local file.
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
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#666666] hover:text-[#7A2E2E] transition-colors border border-[#E2E2DF] hover:border-[#7A2E2E] px-3 py-1.5"
        >
          <LogOut size={13} />
          Log Out
        </button>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-120px)]">

        {/* ── Sidebar Navigation ── */}
        <nav className="lg:w-52 bg-[#F8F8F6] border-b lg:border-b-0 lg:border-r border-[#E2E2DF] p-4 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible flex-shrink-0">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activeTab === id
                ? "bg-[#7A2E2E] text-white"
                : "text-[#666666] hover:bg-white hover:text-[#222222]"
                }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>

        {/* ── Tab Content ── */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === "business" && <BusinessTab content={content} setContent={setContent} token={token} />}
          {activeTab === "homepage" && <HomepageTab content={content} setContent={setContent} token={token} />}
          {activeTab === "brands" && <BrandsTab content={content} setContent={setContent} token={token} />}
          {activeTab === "reviews" && <ReviewsTab content={content} setContent={setContent} token={token} />}
          {activeTab === "gallery" && <GalleryTab content={content} setContent={setContent} token={token} />}
          {activeTab === "products" && <ProductsTab token={token} />}
        </main>

      </div>
    </div>
  );
}
