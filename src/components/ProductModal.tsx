"use client";

import React, { useState, useEffect } from "react";
import {
  X, MessageSquare, Phone, ShieldCheck, Gift,
  Zap, CreditCard, Sparkles, CheckCircle, AlertCircle,
  Package, ChevronLeft, ChevronRight, Share2, Check
} from "lucide-react";
import { Product } from "@/data/products";
import { STATIC_CONTENT } from "@/data/siteContent";
import { formatPrice, getDiscountBadge, calculateProductPricing } from "@/components/ProductCard";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber?: string;
  phoneNumber?: string;
}

export default function ProductModal({
  product,
  isOpen,
  onClose,
  whatsappNumber = "917002733658",
  phoneNumber = "+91 70027 33658",
}: ProductModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Reset active image index when product changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [product?.id]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map((s) => String(s).trim()).filter(Boolean)
    : ((product as any).image ? [String((product as any).image).trim()] : []);

  const activeImage = images[activeImageIndex] || images[0] || "";

  const whatsappMessage = encodeURIComponent(
    `Hi ${STATIC_CONTENT.ownerName}, I am interested in ${product.brand} ${product.name} listed on your website. Is it available in stock?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const handleShare = async () => {
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/products/${encodeURIComponent(product.id)}`
      : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.brand} ${product.name} | Maa Radio`,
          text: `Check out the ${product.brand} ${product.name} at Maa Radio!`,
          url,
        });
      } catch {
        // User cancelled or share failed
      }
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const nextImage = () => {
    if (images.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-xs">
              {product.category}
            </span>
            {product.featured && (
              <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                <Sparkles size={11} className="text-amber-600" /> Featured Deal
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all border border-slate-200/80 shadow-xs"
              title="Share product link"
            >
              {copied ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all border border-slate-200/80 shadow-xs"
              title="Close modal (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left: Product Images Gallery */}
            <div className="md:col-span-6 flex flex-col gap-4">
              <div className="relative aspect-square w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl flex items-center justify-center p-6 overflow-hidden group">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="max-h-[320px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-slate-300 flex flex-col items-center gap-2">
                    <Package size={56} />
                    <span className="text-xs text-slate-400">No image available</span>
                  </div>
                )}

                {/* Stock Status Badge */}
                <div className="absolute bottom-3 right-3">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border shadow-xs flex items-center gap-1.5 ${
                      product.stockStatus === "In Stock" || product.stockStatus === "Limited Stock"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {product.stockStatus === "In Stock" ? (
                      <CheckCircle size={11} />
                    ) : (
                      <AlertCircle size={11} />
                    )}
                    {product.stockStatus}
                  </span>
                </div>

                {/* Carousel Controls (if multiple images) */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md border border-slate-200 transition-all opacity-80 hover:opacity-100"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md border border-slate-200 transition-all opacity-80 hover:opacity-100"
                      aria-label="Next image"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails list */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-xl border-2 p-1 bg-white overflow-hidden transition-all ${
                        activeImageIndex === idx
                          ? "border-sky-500 shadow-sm scale-105"
                          : "border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info, Price, Offers, CTAs */}
            <div className="md:col-span-6 flex flex-col gap-6">
              <div>
                <span className="text-[11px] font-bold text-sky-600 uppercase tracking-widest block">
                  {product.brand}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight leading-tight">
                  {product.name}
                </h2>
              </div>

              {/* Pricing Block */}
              {(() => {
                const { hasDiscount, mainPrice, oldPrice, discountBadge } = calculateProductPricing(product);
                return (
                  <div className="p-4 bg-slate-50/90 border border-slate-200/80 rounded-2xl flex items-baseline gap-3 flex-wrap">
                    {hasDiscount ? (
                      <>
                        <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                          {mainPrice}
                        </span>
                        <span className="text-sm line-through text-slate-400 font-medium">
                          {oldPrice}
                        </span>
                        {discountBadge && (
                          <span className="bg-rose-500 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ml-auto shadow-xs">
                            {discountBadge}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                        {mainPrice || "Price on Request"}
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* Special Offers Grid */}
              {(product.freeGift || product.comboOffer || product.cashbackOffer || product.emiAvailable || product.warranty || product.offersAndPromotions) && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Available Offers &amp; Benefits
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {product.emiAvailable && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-teal-50/80 border border-teal-200 text-teal-900 font-medium">
                        <CreditCard size={15} className="text-teal-700 flex-shrink-0" />
                        <span>Easy EMI Options Available</span>
                      </div>
                    )}
                    {product.warranty && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium">
                        <ShieldCheck size={15} className="text-sky-600 flex-shrink-0" />
                        <span>{product.warranty}</span>
                      </div>
                    )}
                    {product.freeGift && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 font-medium sm:col-span-2">
                        <Gift size={15} className="text-emerald-700 flex-shrink-0" />
                        <span>Free Gift: {product.freeGift}</span>
                      </div>
                    )}
                    {product.comboOffer && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 font-medium sm:col-span-2">
                        <Zap size={15} className="text-blue-700 flex-shrink-0" />
                        <span>Combo Deal: {product.comboOffer}</span>
                      </div>
                    )}
                    {product.cashbackOffer && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-50/80 border border-purple-200 text-purple-900 font-medium sm:col-span-2">
                        <Sparkles size={15} className="text-purple-700 flex-shrink-0" />
                        <span>Cashback: {product.cashbackOffer}</span>
                      </div>
                    )}
                    {product.offersAndPromotions && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 font-medium sm:col-span-2">
                        <Sparkles size={15} className="text-amber-700 flex-shrink-0" />
                        <span>Promotion: {product.offersAndPromotions}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-md hover:shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                >
                  <MessageSquare size={16} />
                  Enquire on WhatsApp
                </a>
                <a
                  href={`tel:${phoneNumber}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 border border-slate-200 hover:border-slate-400 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all hover:bg-slate-50 active:scale-[0.98]"
                >
                  <Phone size={15} />
                  Call Store
                </a>
              </div>
            </div>
          </div>

          {/* Full Description & Specifications Section */}
          <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Description */}
            <div className="md:col-span-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Product Overview
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description || "No detailed description provided for this product."}
              </p>
            </div>

            {/* Specifications */}
            <div className="md:col-span-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Technical Specifications
              </h3>
              {Array.isArray(product.specifications) && product.specifications.length > 0 ? (
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="px-4 py-2.5 text-xs flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 flex-shrink-0" />
                      <span className="text-slate-700 font-medium leading-relaxed">{spec}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No specifications listed for this item.</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Note */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/80 text-center text-[11px] text-slate-500">
          Visit Maa Radio store in Gogamukh, Assam or tap WhatsApp for instant product verification &amp; best deals.
        </div>
      </div>
    </div>
  );
}
