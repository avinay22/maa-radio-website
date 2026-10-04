"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Zap, Layers, Cpu, Package, Sparkles } from "lucide-react";
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
    <div className="bg-slate-50/50 pt-28 pb-20 min-h-screen relative">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-72 bg-gradient-to-b from-sky-200/20 via-blue-200/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Editorial Page Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-slate-200/80 pb-10 mb-12 items-end">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-bold tracking-wider uppercase mb-3">
              <Sparkles size={12} className="text-sky-600" />
              <span>Genuine Smartphone Gear</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Premium Mobile Accessories
            </h1>
            <p className="text-slate-600 text-sm sm:text-base mt-3 max-w-xl leading-relaxed">
              Don&apos;t compromise your smartphone with substandard peripherals. Maa Radio offers certified fast chargers, military-grade cases, and heavy-duty cables engineered for safety and battery longevity.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col items-start lg:items-end gap-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full shadow-xs">
              <ShieldCheck size={15} />
              <span>100% Brand Certified &amp; Tested</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-3.5 py-1.5 rounded-full shadow-xs">
              <Zap size={15} />
              <span>GaN &amp; PD Ultra-Fast Charging</span>
            </div>
          </div>
        </div>

        {/* Editorial Info Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-4">
              <Cpu size={24} />
            </div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Battery Health Protection</h4>
            <p className="text-xs text-slate-500 leading-relaxed mt-2">
              Cheap adapters generate fluctuating currents that degrade battery life. Our chargers maintain steady temperature and voltage regulation.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
              <Layers size={24} />
            </div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Air-Cushioned Shock Drop</h4>
            <p className="text-xs text-slate-500 leading-relaxed mt-2">
              We stock hybrid tempered glass and phone covers with reinforced corner bumpers, protecting fragile camera lens modules from direct drop impacts.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4">
              <Zap size={24} />
            </div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Heavy Braided Durability</h4>
            <p className="text-xs text-slate-500 leading-relaxed mt-2">
              Reinforced strain-relief collars and braided copper cores tested for 30,000+ bends ensure safe charging without port wobble or short-circuits.
            </p>
          </div>
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              In-Stock Accessories
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select any accessory to inspect specs, check stock, or enquire via WhatsApp.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-xs">
            {products.length} Items Available
          </span>
        </div>

        {/* Accessories Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs">
            <Package size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No accessories listed yet</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Our accessories collection is currently being updated. Visit our store in Gogamukh or reach out directly on WhatsApp.
            </p>
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
