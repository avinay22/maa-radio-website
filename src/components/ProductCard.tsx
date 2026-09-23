"use client";

import React from "react";
import { MessageSquare, Eye, Sparkles, CheckCircle, AlertCircle, Package } from "lucide-react";
import { Product } from "@/data/products";
import { STATIC_CONTENT } from "@/data/siteContent";

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
    ? product.images
    : [];

  const mainImage = images[0] || "";

  const whatsappMessage = encodeURIComponent(
    `Hi ${STATIC_CONTENT.ownerName}, I am interested in buying the ${product.brand} ${product.name} listed on your website. Is it currently in stock?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div
      onClick={() => onViewDetails(product)}
      className={`relative bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between p-5 group cursor-pointer hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/5 ${
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
          {product.discountPercentage && (
            <span className="text-[9px] bg-[#7A2E2E] text-white px-2 py-0.5 font-bold uppercase rounded-full ml-auto">
              {product.discountPercentage} OFF
            </span>
          )}
        </div>

        {/* Brand & Name */}
        <div className="mb-3">
          <span className="text-[10px] font-bold text-[#8A6A44] uppercase tracking-wider block">
            {product.brand}
          </span>
          <h3 className="text-base font-bold text-[#222222] mt-0.5 group-hover:text-[#7A2E2E] transition-colors line-clamp-1">
            {product.name}
          </h3>
        </div>

        {/* Product Image Stage */}
        <div className="aspect-[4/3] w-full bg-[#FAF9F6] border border-[#E2E2DF]/60 rounded-xl p-4 mb-4 flex items-center justify-center overflow-hidden relative">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              className="max-h-[140px] w-auto object-contain transition-transform duration-500 group-hover:scale-108"
              loading="lazy"
            />
          ) : (
            <div className="text-[#CCCCCC] flex flex-col items-center gap-1">
              <Package size={40} />
            </div>
          )}

          {/* Stock status pill */}
          <div className="absolute bottom-2 right-2">
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
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md">
              {images.length} photos
            </div>
          )}
        </div>

        {/* Pricing Layout */}
        <div className="flex items-baseline gap-2 mb-3">
          {product.discountPrice ? (
            <>
              <span className="text-lg sm:text-xl font-black text-[#7A2E2E]">
                {product.discountPrice}
              </span>
              <span className="text-xs line-through text-[#888888] font-medium">
                {product.originalPrice}
              </span>
            </>
          ) : product.originalPrice ? (
            <span className="text-lg sm:text-xl font-black text-[#7A2E2E]">
              {product.originalPrice}
            </span>
          ) : (
            <span className="text-sm font-semibold text-[#666666]">
              Price on request
            </span>
          )}
        </div>

        {/* Description snippet */}
        <p className="text-xs text-[#666666] leading-relaxed line-clamp-2 mb-3">
          {product.description}
        </p>

        {/* Specifications preview badges */}
        {Array.isArray(product.specifications) && product.specifications.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
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
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#E2E2DF] hover:border-[#222222] hover:bg-[#FAF9F6] text-[#222222] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
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
