"use client";

import React, { useState } from "react";
import { MessageSquare, Eye, Sparkles, CheckCircle, AlertCircle, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/data/products";
import { STATIC_CONTENT } from "@/data/siteContent";

/**
 * Formats any price input into Indian Currency format (e.g. ₹16,499)
 */
export function formatPrice(price?: string | number): string {
  if (price === undefined || price === null || price === "") return "";
  const str = String(price).trim();
  const numericOnly = str.replace(/[^\d.]/g, "");
  if (!numericOnly) return str;
  const num = parseFloat(numericOnly);
  if (isNaN(num)) return str;
  const formatted = num.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
  return `₹${formatted}`;
}

/**
 * Extracts or computes the discount badge text (e.g. "20% OFF")
 */
export function getDiscountBadge(
  original?: string | number,
  discount?: string | number,
  explicitDiscount?: string
): string {
  if (explicitDiscount) {
    const raw = String(explicitDiscount).trim();
    const numMatch = raw.match(/(\d+(?:\.\d+)?)/);
    if (numMatch) {
      return `${Math.round(parseFloat(numMatch[1]))}% OFF`;
    }
    return raw;
  }
  if (!original || !discount) return "";
  const origNum = parseFloat(String(original).replace(/[^\d.]/g, ""));
  const discNum = parseFloat(String(discount).replace(/[^\d.]/g, ""));
  if (origNum > 0 && discNum > 0 && origNum > discNum) {
    const pct = Math.round(((origNum - discNum) / origNum) * 100);
    if (pct > 0) return `${pct}% OFF`;
  }
  return "";
}

/**
 * Calculates effective pricing and discount status for any product
 */
export function calculateProductPricing(product: {
  originalPrice?: string | number;
  discountPrice?: string | number;
  discountPercentage?: string;
}) {
  const origStr = String(product.originalPrice || "").trim();
  const discStr = String(product.discountPrice || "").trim();
  const origNum = parseFloat(origStr.replace(/[^\d.]/g, ""));
  let discNum = discStr ? parseFloat(discStr.replace(/[^\d.]/g, "")) : 0;

  let effectiveDiscountPrice = discStr;

  // If discount percentage is provided without explicit discount price
  if (!effectiveDiscountPrice && product.discountPercentage && origNum > 0) {
    const pctMatch = String(product.discountPercentage).match(/(\d+(?:\.\d+)?)/);
    if (pctMatch) {
      const pct = parseFloat(pctMatch[1]);
      if (pct > 0 && pct < 100) {
        discNum = Math.round(origNum * (1 - pct / 100));
        effectiveDiscountPrice = String(discNum);
      }
    }
  }

  const hasDiscount = Boolean(
    effectiveDiscountPrice &&
    effectiveDiscountPrice !== "" &&
    origNum > 0 &&
    discNum > 0 &&
    origNum > discNum
  );

  const mainPrice = hasDiscount
    ? formatPrice(effectiveDiscountPrice)
    : (formatPrice(origStr) || (discStr ? formatPrice(discStr) : ""));
  const oldPrice = hasDiscount ? formatPrice(origStr) : "";
  const discountBadge = hasDiscount
    ? getDiscountBadge(origStr, effectiveDiscountPrice, product.discountPercentage)
    : "";

  return {
    hasDiscount,
    mainPrice,
    oldPrice,
    discountBadge,
    effectiveDiscountPrice,
  };
}

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  whatsappNumber?: string;
  className?: string;
}

export default function ProductCard({
  product,
  onViewDetails,
  whatsappNumber = "917002733658",
  className = "",
}: ProductCardProps) {
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images.filter(Boolean)
    : ((product as any).image ? [(product as any).image] : []);

  const [activeIdx, setActiveIdx] = useState(0);
  const currentImage = images[activeIdx] || images[0] || "";

  const whatsappMessage = encodeURIComponent(
    `Hi ${STATIC_CONTENT.ownerName}, I am interested in buying the ${product.brand} ${product.name} listed on your website. Is it currently in stock?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  // Price calculations & formatting
  const { mainPrice, oldPrice, discountBadge } = calculateProductPricing(product);

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 1) {
      setActiveIdx((prev) => (prev + 1) % images.length);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 1) {
      setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <div
      onClick={() => onViewDetails(product)}
      className={`relative bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between p-5 sm:p-6 group cursor-pointer hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/10 ${
        product.featured
          ? "border-amber-300/80 bg-gradient-to-b from-amber-50/20 via-white to-white"
          : "border-[#E2E2DF] hover:border-[#7A2E2E]/40"
      } ${className}`}
    >
      <div>
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3 min-h-[22px]">
          {product.featured && (
            <span className="text-[9px] bg-amber-100 border border-amber-300 text-amber-900 px-2 py-0.5 font-bold uppercase rounded-full flex items-center gap-1">
              <Sparkles size={10} /> Featured
            </span>
          )}
          {product.newArrival && (
            <span className="text-[9px] bg-blue-50 border border-blue-200 text-blue-800 px-2 py-0.5 font-bold uppercase rounded-full">
              New
            </span>
          )}
          {product.bestSeller && (
            <span className="text-[9px] bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 font-bold uppercase rounded-full">
              Best Seller
            </span>
          )}
        </div>

        {/* Brand & Name */}
        <div className="mb-3">
          <span className="text-[10px] font-bold text-[#8A6A44] uppercase tracking-wider block">
            {product.brand}
          </span>
          <h3 className="text-base font-bold text-[#111111] mt-0.5 group-hover:text-[#7A2E2E] transition-colors line-clamp-1">
            {product.name}
          </h3>
        </div>

        {/* Product Image Stage with Interactive Multi-photo Browsing */}
        <div className="aspect-[4/3] w-full bg-[#FAF9F6] border border-[#E2E2DF]/60 rounded-xl p-4 mb-4 flex items-center justify-center overflow-hidden relative group/img">
          {currentImage ? (
            <img
              src={currentImage}
              alt={`${product.name} - photo ${activeIdx + 1}`}
              className="max-h-[140px] w-auto object-contain transition-transform duration-500 group-hover:scale-108"
              loading="lazy"
            />
          ) : (
            <div className="text-[#CCCCCC] flex flex-col items-center gap-1">
              <Package size={40} />
            </div>
          )}

          {/* Navigation Arrows for Multiple Photos */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/95 hover:bg-white text-[#222222] shadow border border-[#E2E2DF] flex items-center justify-center transition-all opacity-0 group-hover/img:opacity-100 hover:scale-110"
                title="Previous photo"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/95 hover:bg-white text-[#222222] shadow border border-[#E2E2DF] flex items-center justify-center transition-all opacity-0 group-hover/img:opacity-100 hover:scale-110"
                title="Next photo"
              >
                <ChevronRight size={15} />
              </button>

              {/* Dot Indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIdx(i);
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      activeIdx === i ? "bg-white w-3" : "bg-white/60 hover:bg-white w-1.5"
                    }`}
                    title={`View photo ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Stock status pill */}
          <div className="absolute top-2 right-2 z-10">
            <span
              className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                product.stockStatus === "In Stock" || product.stockStatus === "Limited Stock"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {product.stockStatus === "In Stock" ? (
                <CheckCircle size={8} />
              ) : (
                <AlertCircle size={8} />
              )}
              {product.stockStatus}
            </span>
          </div>

          {/* Multiple images indicator */}
          {images.length > 1 && (
            <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md">
              {activeIdx + 1}/{images.length} photos
            </div>
          )}
        </div>

        {/* Price Hierarchy Section */}
        <div className="flex items-baseline flex-wrap gap-2.5 mb-3">
          {mainPrice ? (
            <span className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">
              {mainPrice}
            </span>
          ) : (
            <span className="text-sm font-semibold text-[#666666]">
              Price on request
            </span>
          )}

          {oldPrice && (
            <span className="text-xs sm:text-sm text-[#888888] line-through font-medium">
              {oldPrice}
            </span>
          )}

          {discountBadge && (
            <span className="bg-[#DC2626] text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider inline-flex items-center shadow-xs ml-auto sm:ml-0">
              {discountBadge}
            </span>
          )}
        </div>

        {/* Description snippet */}
        <p className="text-xs text-[#666666] leading-relaxed line-clamp-2 mb-3">
          {product.description}
        </p>

        {/* Specifications preview badges */}
        {Array.isArray(product.specifications) && product.specifications.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.specifications.slice(0, 2).map((spec, i) => (
              <span
                key={i}
                className="text-[9px] text-[#555555] bg-[#FAF9F6] border border-[#E2E2DF] px-2 py-0.5 rounded-md tracking-wide line-clamp-1 max-w-full"
              >
                {spec}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="pt-3 border-t border-[#E2E2DF] grid grid-cols-2 gap-2 mt-auto">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(product);
          }}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#E2E2DF] hover:border-[#111111] hover:bg-[#FAF9F6] text-[#222222] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <Eye size={13} />
          Details
        </button>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#7A2E2E] hover:bg-[#5F2222] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
        >
          <MessageSquare size={13} />
          Enquire
        </a>
      </div>
    </div>
  );
}
