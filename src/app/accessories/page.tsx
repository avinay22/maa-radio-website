"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, ShieldCheck, Zap, Layers, Cpu } from "lucide-react";
import { Product } from "@/data/products";
import { fetchProducts } from "@/lib/apiClient";

export default function AccessoriesPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then((allProducts) => {
      const accessories = allProducts.filter(
        (p) => p.category === "Accessories"
      );
      setProducts(accessories);
    });
  }, []);

  const getWhatsAppLink = (product: Product) => {
    const text = encodeURIComponent(
      `Hi Tushar, I am looking to purchase the accessory: ${product.brand} ${product.name}. Is it currently in stock at Maa Radio?`
    );
    return `https://wa.me/917002733658?text=${text}`;
  };

  return (
    <div className="bg-white pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Editorial Page Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-border pb-12 mb-16 items-end">
          <div className="lg:col-span-7">
            <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">
              Curated Essentials
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#222222] mt-2 leading-tight">
              Premium Accessories
            </h1>
            <p className="text-[#666666] text-base mt-4 max-w-xl leading-relaxed">
              Don't compromise your flagship devices with substandard peripherals. Maa Radio offers a hand-selected collection of chargers, cases, and premium cables certified for safety and maximum efficiency.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col items-start lg:items-end gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8A6A44] uppercase tracking-wider">
              <ShieldCheck size={16} />
              <span>100% Brand Certified</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8A6A44] uppercase tracking-wider">
              <Zap size={16} />
              <span>Safe GaN & PD Fast Charging</span>
            </div>
          </div>
        </div>

        {/* Informative Editorial Block (Asymmetric) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-[#F8F8F6] border border-[#E2E2DF] p-8 md:p-12 mb-16">
          <div className="space-y-3">
            <div className="text-[#7A2E2E]"><Cpu size={24} /></div>
            <h4 className="text-sm font-bold text-[#222222] uppercase tracking-wide">Battery Integrity</h4>
            <p className="text-xs text-[#666666] leading-relaxed">
              Cheap adapters generate fluctuating voltage that degrades phone battery health. Our chargers feature active safety checks and steady power profiles.
            </p>
          </div>
          <div className="space-y-3">
            <div className="text-[#7A2E2E]"><Layers size={24} /></div>
            <h4 className="text-sm font-bold text-[#222222] uppercase tracking-wide">Mil-Grade Shock Absorption</h4>
            <p className="text-xs text-[#666666] leading-relaxed">
              We stock hybrid phone covers that absorb impacts through custom air cushioning, guarding sensitive camera sensors from drop shocks.
            </p>
          </div>
          <div className="space-y-3">
            <div className="text-[#7A2E2E]"><Zap size={24} /></div>
            <h4 className="text-sm font-bold text-[#222222] uppercase tracking-wide">Braided Durability</h4>
            <p className="text-xs text-[#666666] leading-relaxed">
              Ordinary cables fray and short-circuit. Our braided copper cables are laboratory-tested to survive over 30,000 bends, preventing charge port damage.
            </p>
          </div>
        </div>

        {/* Accessories Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-[#F8F8F6] border border-[#E2E2DF]">
            <p className="text-[#666666] text-sm">No accessories are currently loaded in the database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((item) => (
              <div
                key={item.id}
                className="bg-[#F8F8F6] border border-[#E2E2DF] p-6 flex flex-col justify-between group hover:shadow-sm transition-all duration-300"
              >
                <div>
                  {/* Brand & Price */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[9px] font-bold text-[#8A6A44] uppercase tracking-wider">
                      {item.brand}
                    </span>
                    {item.price && (
                      <span className="text-xs font-semibold text-[#7A2E2E]">
                        {item.price}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-sm font-bold text-[#222222] group-hover:text-[#7A2E2E] transition-colors mb-4 line-clamp-1">
                    {item.name}
                  </h3>

                  {/* Image */}
                  <div className="aspect-square bg-white border border-[#E2E2DF] p-6 mb-6 flex items-center justify-center overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="max-h-[140px] w-auto object-contain group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* Specs & Description */}
                  <p className="text-xs text-[#666666] leading-relaxed line-clamp-2 mb-4">
                    {item.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.specifications.map((spec, index) => (
                      <span
                        key={index}
                        className="text-[8px] bg-white border border-[#E2E2DF] text-[#666666] px-1.5 py-0.5 uppercase tracking-wide"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* WhatsApp Trigger */}
                <div className="pt-4 border-t border-[#E2E2DF] mt-4">
                  <a
                    href={getWhatsAppLink(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#7A2E2E] hover:bg-[#5F2222] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    <MessageSquare size={12} />
                    WhatsApp Check
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
