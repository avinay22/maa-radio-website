"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Zap, Layers, Cpu, Package } from "lucide-react";
import { Product } from "@/data/products";
import { SiteContent, DEFAULT_SITE_CONTENT } from "@/data/siteContent";
import { fetchProducts, fetchSiteContent } from "@/lib/apiClient";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";

export default function AccessoriesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sc, setSc] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts().then((allProducts) => {
      const accessories = allProducts.filter(
        (p) => p.category === "Accessories"
      );
      setProducts(accessories);
    });
    fetchSiteContent().then(setSc);
  }, []);

  return (
    <div className="bg-white pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Editorial Page Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-[#E2E2DF] pb-12 mb-16 items-end">
          <div className="lg:col-span-7">
            <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">
              Curated Essentials
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#222222] mt-2 leading-tight">
              Premium Accessories
            </h1>
            <p className="text-[#666666] text-base mt-4 max-w-xl leading-relaxed">
              Don&apos;t compromise your flagship devices with substandard peripherals. Maa Radio offers a hand-selected collection of chargers, cases, and premium cables certified for safety and maximum efficiency.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col items-start lg:items-end gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8A6A44] uppercase tracking-wider">
              <ShieldCheck size={16} />
              <span>100% Brand Certified</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8A6A44] uppercase tracking-wider">
              <Zap size={16} />
              <span>Safe GaN &amp; PD Fast Charging</span>
            </div>
          </div>
        </div>

        {/* Editorial Info Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-[#F8F8F6] border border-[#E2E2DF] p-8 md:p-12 mb-16 rounded-2xl">
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
          <div className="text-center py-20 bg-[#F8F8F6] border border-[#E2E2DF] rounded-2xl">
            <Package size={40} className="mx-auto text-[#CCCCCC] mb-4" />
            <p className="text-[#666666] text-sm">No accessories in the catalogue yet. Add products with the &quot;Accessories&quot; category from the Admin Panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onViewDetails={setModalProduct}
                whatsappNumber={sc.whatsapp}
              />
            ))}
          </div>
        )}

      </div>

      {/* Product Details Modal */}
      <ProductModal
        product={modalProduct}
        isOpen={Boolean(modalProduct)}
        onClose={() => setModalProduct(null)}
        whatsappNumber={sc.whatsapp}
        phoneNumber={sc.phone}
      />
    </div>
  );
}
