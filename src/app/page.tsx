"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, ShieldCheck, HeartHandshake,
  Sparkles, Phone, MessageSquare, MapPin,
  Gift, CreditCard, Wrench, Star, Tag,
  Clock, CheckCircle, AlertCircle, Package, Zap
} from "lucide-react";
import { SiteContent, DEFAULT_SITE_CONTENT, STATIC_CONTENT } from "@/data/siteContent";
import { Product } from "@/data/products";
import { fetchSiteContent, fetchProducts } from "@/lib/apiClient";
import ProductCard, { calculateProductPricing } from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";

// ── Offer type badge colours ──────────────────────────────────────────────────
const OFFER_COLOURS: Record<string, { bg: string; text: string; border: string }> = {
  "Festival Offers":          { bg: "bg-amber-50",  text: "text-amber-800",  border: "border-amber-200" },
  "Wedding Package Discounts":{ bg: "bg-rose-50",   text: "text-rose-800",   border: "border-rose-200" },
  "Combo Offers":             { bg: "bg-blue-50",   text: "text-blue-800",   border: "border-blue-200" },
  "Free Gifts":               { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
  "Cashback Offers":          { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
  "EMI Available":            { bg: "bg-teal-50",   text: "text-teal-800",   border: "border-teal-200" },
  "Limited Time Deals":       { bg: "bg-red-50",    text: "text-red-800",    border: "border-red-200" },
};

export default function HomePage() {
  const [sc, setSc] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [products, setProducts] = useState<Product[]>([]);
  const [homeTab, setHomeTab] = useState<"featured" | "new">("featured");
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchSiteContent().then(setSc);
    fetchProducts().then(setProducts);
  }, []);

  const whatsappLink = `https://wa.me/${sc.whatsapp}`;

  const iconMap: Record<string, React.ReactNode> = {
    shield:        <ShieldCheck size={24} />,
    handshake:     <HeartHandshake size={24} />,
    message:       <MessageSquare size={24} />,
    gift:          <Gift size={24} />,
    "credit-card": <CreditCard size={24} />,
    wrench:        <Wrench size={24} />,
    star:          <Star size={24} />,
  };

  // Hero featured product — first product marked as featured
  const heroProduct = products.find((p) => p.featured) ?? null;
  const heroEnquireLink = heroProduct
    ? `https://wa.me/${sc.whatsapp}?text=${encodeURIComponent(
        `Hi ${STATIC_CONTENT.ownerName}, I am interested in the ${heroProduct.brand} ${heroProduct.name} listed on your website.`
      )}`
    : whatsappLink;

  const featuredProducts = products.filter((p) => p.featured);
  const newArrivals = [...products].sort((a, b) =>
    String(b.id || "").localeCompare(String(a.id || ""))
  );

  // Sorted categories from admin panel
  const sortedCategories = [...sc.categories].sort((a, b) => a.sortOrder - b.sortOrder);

  // Active offers only
  const activeOffers = sc.offers.filter((o) => o.enabled);

  // Sorted gallery items
  const sortedGallery = [...sc.gallery].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="overflow-hidden bg-[#FCFCFD]">

      {/* 1. Modern Flagship Hero Section */}
      <section className="relative min-h-[92vh] flex items-center bg-gradient-to-b from-slate-50 via-white to-slate-50/60 pt-32 pb-20 ambient-hero-glow">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center relative z-10">
          
          {/* Hero Left */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200/90 rounded-full shadow-xs text-[#8A6A44] text-[11px] font-bold tracking-wider uppercase mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{STATIC_CONTENT.heroBadge}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12] mb-6 text-pretty"
            >
              {STATIC_CONTENT.heroHeading} <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7A2E2E] via-[#9E3838] to-[#8A6A44]">
                {STATIC_CONTENT.heroHeadingAccent}.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-slate-600 text-base md:text-lg leading-relaxed mb-6 max-w-lg text-pretty font-normal"
            >
              {STATIC_CONTENT.heroBody}
            </motion.p>

            {/* Quick Trust Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="flex flex-wrap gap-2.5 mb-8"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 text-xs font-semibold shadow-2xs">
                <ShieldCheck size={13} className="text-emerald-600" /> 100% Genuine Brands
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 text-xs font-semibold shadow-2xs">
                <Zap size={13} className="text-amber-500" /> In-Store Live Demo
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 text-xs font-semibold shadow-2xs">
                <CreditCard size={13} className="text-blue-500" /> Easy 0% EMI Options
              </span>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
            >
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#7A2E2E] to-[#9E3838] hover:from-[#5F2222] hover:to-[#7A2E2E] text-white text-xs font-bold tracking-wider uppercase rounded-full shadow-lg shadow-[#7A2E2E]/25 hover:shadow-xl hover:shadow-[#7A2E2E]/35 hover:-translate-y-0.5 transition-all"
              >
                {STATIC_CONTENT.heroCTAPrimary}
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-800 text-slate-800 text-xs font-bold tracking-wider uppercase rounded-full shadow-xs hover:-translate-y-0.5 transition-all"
              >
                {STATIC_CONTENT.heroCTASecondary}
              </Link>
            </motion.div>
          </div>

          {/* Hero Right — Featured Flagship Product Showcase */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-full max-w-[480px] bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-7 md:p-9 shadow-2xl shadow-slate-900/10 flex flex-col gap-5 hover:shadow-3xl transition-all"
            >
              {heroProduct ? (
                <>
                  {/* Top Bar: Tag & Stock Status */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase block">
                        {STATIC_CONTENT.heroFeaturedLabel}
                      </span>
                      <h3 className="text-xl font-black text-slate-900 mt-1 leading-tight">
                        {heroProduct.name}
                      </h3>
                      <span className="text-[11px] font-bold text-[#8A6A44] uppercase tracking-wider">
                        {heroProduct.brand}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-full border flex items-center gap-1 shadow-xs ${
                        heroProduct.stockStatus === "In Stock" || heroProduct.stockStatus === "Limited Stock"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {heroProduct.stockStatus === "In Stock" ? (
                        <CheckCircle size={9} />
                      ) : (
                        <AlertCircle size={9} />
                      )}
                      {heroProduct.stockStatus}
                    </span>
                  </div>

                  {/* Large Gadget Showcase Stage */}
                  <div className="relative aspect-[4/3] bg-gradient-to-b from-slate-50/90 to-slate-100/60 border border-slate-100 rounded-2xl flex items-center justify-center p-6 overflow-hidden group">
                    {heroProduct.images && heroProduct.images[0] ? (
                      <img
                        src={heroProduct.images[0]}
                        alt={heroProduct.name}
                        className="max-h-[210px] w-auto object-contain transition-transform duration-700 group-hover:scale-108 drop-shadow-md"
                      />
                    ) : (
                      <div className="text-slate-300 flex flex-col items-center gap-2">
                        <Package size={56} />
                      </div>
                    )}
                  </div>

                  {/* Pricing & Specifications */}
                  {(() => {
                    const { hasDiscount, mainPrice, oldPrice, discountBadge } =
                      calculateProductPricing(heroProduct);
                    return (
                      <>
                        {heroProduct.specifications && heroProduct.specifications.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {heroProduct.specifications.slice(0, 3).map((spec, i) => (
                              <span
                                key={i}
                                className="text-[10px] text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-md font-medium"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block">
                              Best Store Price
                            </span>
                            <div className="flex items-baseline gap-2 mt-0.5">
                              {mainPrice ? (
                                <span className="text-2xl font-black text-slate-900 tracking-tight">
                                  {mainPrice}
                                </span>
                              ) : (
                                <span className="text-sm font-semibold text-slate-500">
                                  Price on request
                                </span>
                              )}
                              {oldPrice && (
                                <span className="text-xs text-slate-400 line-through">
                                  {oldPrice}
                                </span>
                              )}
                              {discountBadge && (
                                <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                  {discountBadge}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setModalProduct(heroProduct)}
                              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-800 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Details
                            </button>
                            <a
                              href={heroEnquireLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                            >
                              <MessageSquare size={13} />
                              Enquire
                            </a>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </>
              ) : (
                /* Placeholder when no featured product is set */
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-300">
                    <Package size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Today's Pick</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Feature a product from the Admin Panel to showcase it here.
                    </p>
                  </div>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#7A2E2E] to-[#9E3838] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all"
                  >
                    <MessageSquare size={12} />
                    Chat With Us
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Modern Editorial Tech Statement */}
      <section className="py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-slate-900 via-[#181111] to-slate-950 text-white rounded-3xl p-10 md:p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#7A2E2E]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 text-[#D4AF37] text-[10px] font-bold tracking-widest uppercase rounded-full mb-6"
            >
              <Sparkles size={11} />
              {STATIC_CONTENT.philosophyLabel}
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl font-light text-slate-100 leading-relaxed text-pretty"
            >
              &ldquo;{STATIC_CONTENT.philosophyQuote}&rdquo;
            </motion.p>
          </div>
        </div>
      </section>

      {/* 3. Categories (Sleek Tech Gadget Cards) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">FIND WHAT YOU NEED</span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2 tracking-tight">Shop by Category</h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#7A2E2E] hover:text-[#5F2222] uppercase tracking-widest group"
            >
              View All Products
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {sortedCategories.length === 0 ? (
            <div className="border border-dashed border-slate-200 bg-slate-50 rounded-3xl py-20 text-center">
              <p className="text-sm text-slate-400">Categories will appear here once added from the Admin Panel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {sortedCategories.map((cat, idx) => {
                const gridSpan = idx === 0 ? "md:col-span-7" : idx === 1 ? "md:col-span-5" : "md:col-span-4";
                const catLink = cat.name === "Accessories" ? "/accessories" : `/products?category=${encodeURIComponent(cat.name)}`;
                return (
                  <motion.div
                    key={cat.id}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.3 }}
                    className={`${gridSpan} bg-gradient-to-b from-white to-slate-50 border border-slate-200/80 rounded-3xl min-h-[350px] p-8 md:p-10 flex flex-col justify-between group relative overflow-hidden shadow-xs hover:shadow-xl hover:border-[#7A2E2E]/30 transition-all`}
                  >
                    <div className="z-10 flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-[#8A6A44] font-bold">
                          {String(idx + 1).padStart(2, "0")} / {cat.name.toUpperCase()}
                        </span>
                        <h3 className="text-2xl font-black text-slate-900 mt-1.5">{cat.name}</h3>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-[#7A2E2E] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-2xs text-slate-700">
                        <ArrowRight size={14} />
                      </div>
                    </div>
                    <div className="relative self-center w-full max-w-[240px] aspect-square flex items-center justify-center z-10 mt-6">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-auto h-[180px] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.08)] group-hover:scale-108 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <Link href={catLink} className="absolute inset-0 z-20" />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. Brand Marquee with Sleek Fade Mask */}
      <section className="py-14 bg-slate-50 border-y border-slate-200/70 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 mb-6">
          <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase block">
            {STATIC_CONTENT.brandsLabel}
          </span>
        </div>
        <div className="marquee-mask overflow-hidden">
          <div className="flex w-[200%] gap-16 md:gap-32 animate-marquee items-center whitespace-nowrap">
            {[...STATIC_CONTENT.brands, ...STATIC_CONTENT.brands].map((brand, i) => (
              brand.startsWith("http") || brand.startsWith("/") ? (
                <img
                  key={i}
                  src={brand}
                  alt="Brand logo"
                  className="h-9 w-auto object-contain filter grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 pointer-events-none"
                />
              ) : (
                <span key={i} className="text-2xl md:text-3xl font-black tracking-wider text-slate-400/60 hover:text-[#7A2E2E] transition-colors cursor-default uppercase">
                  {brand}
                </span>
              )
            ))}
          </div>
        </div>
      </section>

      {/* 5. Featured Products & New Arrivals (Pill Segmented Switcher) */}
      <section className="py-24 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">LATEST FROM INVENTORY</span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2 tracking-tight">Featured &amp; New Arrivals</h2>
            </div>
            
            {/* Modern Segmented Pill Switcher */}
            <div className="inline-flex bg-slate-100 p-1.5 rounded-full border border-slate-200/80 shadow-2xs">
              <button
                onClick={() => setHomeTab("featured")}
                className={`px-5 py-2 text-xs font-bold tracking-wider uppercase rounded-full transition-all cursor-pointer ${
                  homeTab === "featured"
                    ? "bg-white text-[#7A2E2E] shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Featured
              </button>
              <button
                onClick={() => setHomeTab("new")}
                className={`px-5 py-2 text-xs font-bold tracking-wider uppercase rounded-full transition-all cursor-pointer ${
                  homeTab === "new"
                    ? "bg-white text-[#7A2E2E] shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                New Arrivals
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(homeTab === "featured" ? featuredProducts : newArrivals).slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={setModalProduct}
                whatsappNumber={sc.whatsapp}
              />
            ))}
          </div>

          {(homeTab === "featured" ? featuredProducts : newArrivals).length === 0 && (
            <div className="text-center py-16 bg-slate-50 border border-slate-200 rounded-3xl">
              <Package size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600 text-sm font-medium">No products in this section yet. Add products from the Admin Panel.</p>
            </div>
          )}
        </div>
      </section>

      {/* 6. Offers & Deals (Dynamic Cards with Rounded Curvature) */}
      {activeOffers.length > 0 && (
        <section className="py-24 bg-slate-50/70 border-b border-slate-200/70">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="max-w-2xl mb-14">
              <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">SPECIAL DEALS</span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2 tracking-tight">Current Offers &amp; Promotions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {activeOffers.map((offer) => {
                const colours = OFFER_COLOURS[offer.type] ?? { bg: "bg-slate-50", text: "text-[#8A6A44]", border: "border-slate-200" };
                return (
                  <motion.div
                    key={offer.id}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border border-slate-200/90 rounded-3xl flex flex-col overflow-hidden shadow-xs hover:shadow-xl transition-all group"
                  >
                    {offer.image && (
                      <div className="w-full border-b border-slate-100 bg-gradient-to-b from-slate-50 to-slate-100/60 p-6 flex items-center justify-center h-[170px] overflow-hidden">
                        <img
                          src={offer.image}
                          alt={offer.title}
                          className="h-full w-auto object-contain group-hover:scale-108 transition-transform duration-500 drop-shadow-sm"
                        />
                      </div>
                    )}
                    <div className="p-7 flex flex-col gap-3.5 flex-1">
                      <span className={`self-start px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider rounded-full border ${colours.bg} ${colours.text} ${colours.border}`}>
                        <Tag size={9} className="inline mr-1" />{offer.type}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">{offer.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed flex-1">{offer.description}</p>
                      {offer.terms && (
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A6A44] border-t border-slate-100 pt-3">
                          T&amp;C: {offer.terms}
                        </p>
                      )}
                      {(offer.startDate || offer.endDate) && (
                        <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                          <Clock size={11} />
                          {offer.startDate ? `From ${offer.startDate}` : ""}{offer.startDate && offer.endDate ? " – " : ""}{offer.endDate ? `Until ${offer.endDate}` : ""}
                        </p>
                      )}
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#7A2E2E] to-[#9E3838] hover:from-[#5F2222] hover:to-[#7A2E2E] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all"
                      >
                        <MessageSquare size={13} />
                        Enquire About Offer
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 7. Why Choose Us (Modern Glass Pods) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-2xl mb-16">
            <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">{STATIC_CONTENT.whyLabel}</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2 tracking-tight">{STATIC_CONTENT.whyHeading}</h2>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">{STATIC_CONTENT.whyDescription}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STATIC_CONTENT.whyCards.map((card, i) => (
              <div key={i} className="bg-gradient-to-b from-white to-slate-50 border border-slate-200/80 rounded-3xl p-8 flex flex-col items-start gap-4 shadow-xs hover:shadow-lg transition-all">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7A2E2E]/10 to-[#8A6A44]/10 text-[#7A2E2E] flex items-center justify-center shadow-2xs">
                  {iconMap[card.icon] || <Sparkles size={24} />}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{card.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Customer Reviews with 5-Star Highlights */}
      <section className="py-24 bg-slate-50 border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-lg mb-14">
            <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">{STATIC_CONTENT.reviewsLabel}</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2 tracking-tight">{STATIC_CONTENT.reviewsHeading}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STATIC_CONTENT.reviews.map((rev, i) => (
              <motion.div
                key={rev.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white border border-slate-200/80 rounded-3xl p-8 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} size={15} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-slate-800 font-normal text-sm leading-relaxed italic">&ldquo;{rev.quote}&rdquo;</p>
                </div>
                <div className="pt-6 border-t border-slate-100 mt-6 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">{rev.author}</span>
                  <span className="text-[10px] font-bold text-[#8A6A44] uppercase tracking-widest">{rev.location}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Shop Gallery */}
      {sortedGallery.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-6">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">{STATIC_CONTENT.galleryLabel}</span>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2 tracking-tight">{STATIC_CONTENT.galleryHeading}</h2>
              </div>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#7A2E2E] hover:text-[#5F2222] uppercase tracking-widest flex items-center gap-1.5">
                Ask About Availability
                <ArrowRight size={13} />
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {sortedGallery.map((item) => (
                <motion.div key={item.id} whileHover={{ scale: 1.03 }} transition={{ duration: 0.3 }} className="relative aspect-square rounded-3xl overflow-hidden shadow-xs hover:shadow-xl border border-slate-200/80 group">
                  <img src={item.imageUrl} alt={item.category} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-108" loading="lazy" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent py-4 px-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-[9px] text-white font-bold uppercase tracking-wider">{item.category}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10. Contact CTA & Maps (Flagship Showcase Card) */}
      <section className="bg-white pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="bg-gradient-to-br from-slate-900 via-[#181111] to-slate-950 text-white rounded-3xl p-8 md:p-14 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative overflow-hidden">
            <div className="lg:col-span-5 flex flex-col items-start z-10">
              <span className="text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase mb-3">VISIT US IN STORE</span>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-4">
                Come Visit Maa Radio Today
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-8">
                Explore latest smartphones, accessories, and audio gear in person. Live product demos and expert assistance await you.
              </p>
              <div className="flex flex-col sm:flex-row gap-3.5 w-full">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all">
                  <MessageSquare size={15} /> Chat on WhatsApp
                </a>
                <a href={`tel:${sc.phone}`} className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all">
                  <Phone size={15} /> Call Store
                </a>
              </div>
              <div className="flex items-center gap-2.5 mt-8 text-xs text-slate-300">
                <MapPin size={16} className="text-[#D4AF37] flex-shrink-0" />
                <span>{STATIC_CONTENT.address} · {sc.hours}</span>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-white/15 shadow-2xl aspect-video relative">
              <iframe
                src={sc.mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Maa Radio Store Location"
                className="w-full h-full min-h-[300px]"
              />
            </div>
          </div>
        </div>
      </section>

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
