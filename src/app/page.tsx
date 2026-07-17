"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, ShieldCheck, HeartHandshake,
  Sparkles, Phone, MessageSquare, MapPin,
  Gift, CreditCard, Wrench, Star, Tag,
  Clock, CheckCircle, AlertCircle, Package
} from "lucide-react";
import { SiteContent, DEFAULT_SITE_CONTENT, STATIC_CONTENT } from "@/data/siteContent";
import { Product } from "@/data/products";
import { fetchSiteContent, fetchProducts } from "@/lib/apiClient";

// ── Offer type badge colours ──────────────────────────────────────────────────
const OFFER_COLOURS: Record<string, { bg: string; text: string; border: string }> = {
  "Festival Offers":          { bg: "bg-amber-50",  text: "text-amber-800",  border: "border-amber-200" },
  "Wedding Package Discounts":{ bg: "bg-rose-50",   text: "text-rose-800",   border: "border-rose-200" },
  "Combo Offers":             { bg: "bg-blue-50",   text: "text-blue-800",   border: "border-blue-200" },
  "Free Gifts":               { bg: "bg-green-50",  text: "text-green-800",  border: "border-green-200" },
  "Cashback Offers":          { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
  "EMI Available":            { bg: "bg-teal-50",   text: "text-teal-800",   border: "border-teal-200" },
  "Limited Time Deals":       { bg: "bg-red-50",    text: "text-red-800",    border: "border-red-200" },
};

export default function HomePage() {
  const [sc, setSc] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [products, setProducts] = useState<Product[]>([]);
  const [homeTab, setHomeTab] = useState<"featured" | "new">("featured");

  useEffect(() => {
    fetchSiteContent().then(setSc);
    fetchProducts().then(setProducts);
  }, []);

  const whatsappLink = `https://wa.me/${sc.whatsapp}`;

  const iconMap: Record<string, React.ReactNode> = {
    shield:        <ShieldCheck size={22} />,
    handshake:     <HeartHandshake size={22} />,
    message:       <MessageSquare size={22} />,
    gift:          <Gift size={22} />,
    "credit-card": <CreditCard size={22} />,
    wrench:        <Wrench size={22} />,
    star:          <Star size={22} />,
  };

  // Hero featured product — first product marked as featured
  const heroProduct = products.find((p) => p.featured) ?? null;
  const heroEnquireLink = heroProduct
    ? `https://wa.me/${sc.whatsapp}?text=${encodeURIComponent(
        `Hi ${STATIC_CONTENT.ownerName}, I am interested in the ${heroProduct.brand} ${heroProduct.name} listed on your website.`
      )}`
    : whatsappLink;

  const featuredProducts = products.filter((p) => p.featured);
  const newArrivals = [...products].sort((a, b) => b.id.localeCompare(a.id));

  // Sorted categories from admin panel
  const sortedCategories = [...sc.categories].sort((a, b) => a.sortOrder - b.sortOrder);

  // Active offers only
  const activeOffers = sc.offers.filter((o) => o.enabled);

  // Sorted gallery items
  const sortedGallery = [...sc.gallery].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="overflow-hidden">

      {/* 1. Asymmetrical Hero Section */}
      <section className="min-h-screen relative flex items-center bg-white pt-24 pb-20">
        <div className="absolute inset-0 pointer-events-none flex justify-between max-w-7xl mx-auto px-6 md:px-12">
          <div className="w-[1px] h-full bg-[#E2E2DF]/50" />
          <div className="w-[1px] h-full bg-[#E2E2DF]/50 hidden md:block" />
          <div className="w-[1px] h-full bg-[#E2E2DF]/50 hidden md:block" />
          <div className="w-[1px] h-full bg-[#E2E2DF]/50" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          {/* Hero Left */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2 px-3 py-1 bg-[#F8F8F6] border border-[#E2E2DF] text-[#8A6A44] text-[10px] font-bold tracking-widest uppercase mb-6"
            >
              <Sparkles size={10} />
              <span>{STATIC_CONTENT.heroBadge}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#222222] leading-[1.1] mb-6 text-pretty"
            >
              {STATIC_CONTENT.heroHeading} <br />
              <span className="text-[#7A2E2E]">{STATIC_CONTENT.heroHeadingAccent}.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-[#666666] text-base md:text-lg leading-relaxed mb-8 max-w-md text-pretty"
            >
              {STATIC_CONTENT.heroBody}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
            >
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#7A2E2E] hover:bg-[#5F2222] text-white text-xs font-bold tracking-wider uppercase transition-colors"
              >
                {STATIC_CONTENT.heroCTAPrimary}
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[#E2E2DF] hover:border-[#222222] text-[#222222] text-xs font-bold tracking-wider uppercase transition-colors"
              >
                {STATIC_CONTENT.heroCTASecondary}
              </Link>
            </motion.div>
          </div>

          {/* Hero Right — Featured Product Card */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="relative w-full max-w-[460px] bg-[#F8F8F6] border border-[#E2E2DF] p-7 md:p-9 flex flex-col gap-4"
            >
              {heroProduct ? (
                <>
                  {/* Top: Label + Status */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-bold tracking-widest text-[#8A6A44] uppercase block">
                        {STATIC_CONTENT.heroFeaturedLabel}
                      </span>
                      <h3 className="text-lg font-extrabold text-[#222222] mt-1 leading-tight">
                        {heroProduct.name}
                      </h3>
                      <span className="text-[10px] font-bold text-[#8A6A44] uppercase tracking-wider">
                        {heroProduct.brand}
                      </span>
                    </div>
                    <span className={`text-[9px] font-bold uppercase px-2 py-1 border flex items-center gap-1 ${
                      heroProduct.stockStatus === "In Stock" || heroProduct.stockStatus === "Limited Stock"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                      {heroProduct.stockStatus === "In Stock" || heroProduct.stockStatus === "Limited Stock"
                        ? <><CheckCircle size={8} /> Available in Store</>
                        : <><AlertCircle size={8} /> {heroProduct.stockStatus}</>
                      }
                    </span>
                  </div>

                  {/* Product Image */}
                  <div className="relative flex justify-center items-center py-4">
                    <div className="absolute w-[220px] h-[220px] bg-[#8A6A44]/5 rounded-full blur-3xl -z-10" />
                    {heroProduct.images?.[0] ? (
                      <img
                        src={heroProduct.images[0]}
                        alt={heroProduct.name}
                        className="w-auto h-[220px] object-contain drop-shadow-[0_20px_40px_rgba(34,34,34,0.12)] hover:scale-105 transition-transform duration-500"
                        loading="eager"
                      />
                    ) : (
                      <div className="w-full h-[200px] flex items-center justify-center text-[#CCCCCC]">
                        <Package size={60} />
                      </div>
                    )}
                  </div>

                  {/* Badges row */}
                  <div className="flex flex-wrap gap-1.5">
                    {heroProduct.discountPercentage && (
                      <span className="bg-[#7A2E2E] text-white text-[9px] font-bold uppercase px-2 py-0.5">
                        {heroProduct.discountPercentage} OFF
                      </span>
                    )}
                    {heroProduct.offersAndPromotions && (
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-bold uppercase px-2 py-0.5">
                        ⏱ Limited Time
                      </span>
                    )}
                    {heroProduct.emiAvailable && (
                      <span className="bg-teal-50 text-teal-800 border border-teal-200 text-[9px] font-bold uppercase px-2 py-0.5">
                        💳 EMI Available
                      </span>
                    )}
                    {heroProduct.freeGift && (
                      <span className="bg-green-50 text-green-800 border border-green-200 text-[9px] font-bold uppercase px-2 py-0.5">
                        🎁 Free Gift
                      </span>
                    )}
                    {heroProduct.warranty && (
                      <span className="bg-[#F8F8F6] text-[#666666] border border-[#E2E2DF] text-[9px] font-bold uppercase px-2 py-0.5">
                        🛡️ {heroProduct.warranty}
                      </span>
                    )}
                  </div>

                  {/* Pricing row */}
                  <div className="flex items-baseline gap-3 pt-1 border-t border-[#E2E2DF]">
                    {heroProduct.discountPrice ? (
                      <>
                        <span className="text-xl font-extrabold text-[#7A2E2E]">{heroProduct.discountPrice}</span>
                        <span className="text-sm line-through text-[#AAAAAA]">{heroProduct.originalPrice}</span>
                      </>
                    ) : (
                      <span className="text-xl font-extrabold text-[#7A2E2E]">{heroProduct.originalPrice}</span>
                    )}
                    <div className="ml-auto">
                      <a
                        href={heroEnquireLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7A2E2E] hover:bg-[#5F2222] text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
                      >
                        <MessageSquare size={11} />
                        {STATIC_CONTENT.heroEnquireLabel}
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                /* Placeholder when no featured product is set */
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                  <div className="w-16 h-16 bg-white border border-[#E2E2DF] flex items-center justify-center text-[#CCCCCC]">
                    <Package size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#222222]">Today's Pick</p>
                    <p className="text-xs text-[#999999] mt-1">
                      Feature a product from the Admin Panel to showcase it here.
                    </p>
                  </div>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7A2E2E] hover:bg-[#5F2222] text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    <MessageSquare size={11} />
                    Chat With Us
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
          <span className="text-[9px] font-bold tracking-widest text-[#666666] uppercase">Scroll</span>
          <div className="w-[1px] h-10 bg-gradient-to-b from-[#222222] to-transparent animate-pulse" />
        </div>
      </section>

      {/* 2. Philosophy Editorial */}
      <section className="bg-[#F8F8F6] border-y border-[#E2E2DF] py-28 md:py-36">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase mb-6"
          >
            {STATIC_CONTENT.philosophyLabel}
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl font-light text-[#222222] leading-snug text-pretty"
          >
            &ldquo;{STATIC_CONTENT.philosophyQuote}&rdquo;
          </motion.p>
        </div>
      </section>

      {/* 3. Categories (Dynamic from Admin Panel) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">FIND WHAT YOU NEED</span>
              <h2 className="text-3xl font-extrabold text-[#222222] mt-2">Shop by Category</h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-[#7A2E2E] hover:text-[#5F2222] uppercase tracking-widest flex items-center gap-2 group"
            >
              View All Products
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {sortedCategories.length === 0 ? (
            <div className="border border-dashed border-[#E2E2DF] bg-[#F8F8F6] py-20 text-center">
              <p className="text-sm text-[#999999]">Categories will appear here once added from the Admin Panel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {sortedCategories.map((cat, idx) => {
                const gridSpan = idx === 0 ? "md:col-span-7" : idx === 1 ? "md:col-span-5" : "md:col-span-4";
                const catLink = cat.name === "Accessories" ? "/accessories" : `/products?category=${encodeURIComponent(cat.name)}`;
                return (
                  <motion.div
                    key={cat.id}
                    whileHover={{ y: -5 }}
                    className={`${gridSpan} bg-[#F8F8F6] border border-[#E2E2DF] min-h-[350px] p-10 flex flex-col justify-between group relative overflow-hidden`}
                  >
                    <div className="z-10">
                      <span className="text-[10px] font-mono text-[#8A6A44] font-bold">
                        {String(idx + 1).padStart(2, "0")} / {cat.name.toUpperCase()}
                      </span>
                      <h3 className="text-2xl font-bold text-[#222222] mt-2">{cat.name}</h3>
                    </div>
                    <div className="relative self-center w-full max-w-[240px] aspect-square flex items-center justify-center z-10 mt-8">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-auto h-[180px] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.08)] group-hover:scale-105 transition-transform duration-500"
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

      {/* 4. Brand Marquee */}
      <section className="py-16 bg-[#F8F8F6] border-y border-[#E2E2DF] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 mb-8">
          <span className="text-[9px] font-bold tracking-widest text-[#8A6A44] uppercase">{STATIC_CONTENT.brandsLabel}</span>
        </div>
        <div className="flex w-[200%] gap-16 md:gap-32 animate-marquee items-center whitespace-nowrap">
          {[...STATIC_CONTENT.brands, ...STATIC_CONTENT.brands].map((brand, i) => (
            brand.startsWith("http") || brand.startsWith("/") ? (
              <img
                key={i}
                src={brand}
                alt="Brand logo"
                className="h-10 w-auto object-contain filter grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 pointer-events-none"
              />
            ) : (
              <span key={i} className="text-2xl md:text-3xl font-extrabold tracking-wider text-[#222222]/30 hover:text-[#7A2E2E] transition-colors cursor-default uppercase">
                {brand}
              </span>
            )
          ))}
        </div>
      </section>

      {/* 5. Featured Products & New Arrivals */}
      <section className="py-24 bg-white border-b border-[#E2E2DF]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">LATEST FROM INVENTORY</span>
              <h2 className="text-3xl font-extrabold text-[#222222] mt-2">Featured &amp; New Arrivals</h2>
            </div>
            <div className="flex border-b border-[#E2E2DF]">
              <button
                onClick={() => setHomeTab("featured")}
                className={`px-4 py-2 text-xs font-bold tracking-wider uppercase border-b-2 transition-all focus:outline-none cursor-pointer ${
                  homeTab === "featured"
                    ? "border-[#7A2E2E] text-[#7A2E2E]"
                    : "border-transparent text-[#666666] hover:text-[#222222]"
                }`}
              >
                Featured Products
              </button>
              <button
                onClick={() => setHomeTab("new")}
                className={`px-4 py-2 text-xs font-bold tracking-wider uppercase border-b-2 transition-all focus:outline-none cursor-pointer ${
                  homeTab === "new"
                    ? "border-[#7A2E2E] text-[#7A2E2E]"
                    : "border-transparent text-[#666666] hover:text-[#222222]"
                }`}
              >
                New Arrivals
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {(homeTab === "featured" ? featuredProducts : newArrivals).slice(0, 4).map((product) => (
              <div
                key={product.id}
                className="bg-[#F8F8F6] border border-[#E2E2DF] p-6 flex flex-col justify-between group hover:shadow-sm transition-all duration-300 relative"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[9px] font-bold text-[#8A6A44] uppercase tracking-wider">
                      {product.brand}
                    </span>
                    {(product.discountPrice || product.originalPrice) && (
                      <span className="text-xs font-semibold text-[#7A2E2E] bg-white px-2 py-0.5 border border-[#E2E2DF]">
                        {product.discountPrice || product.originalPrice}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[#222222] group-hover:text-[#7A2E2E] transition-colors mb-4 line-clamp-1">
                    {product.name}
                  </h3>

                  <div className="aspect-square bg-white border border-[#E2E2DF] p-6 mb-6 flex items-center justify-center overflow-hidden">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="max-h-[140px] w-auto object-contain group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-[#CCCCCC]"><Package size={48} /></div>
                    )}
                  </div>

                  {/* Offer badges */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.emiAvailable && (
                      <span className="text-[8px] bg-teal-50 border border-teal-200 text-teal-800 px-1.5 py-0.5 uppercase tracking-wide font-bold">EMI</span>
                    )}
                    {product.freeGift && (
                      <span className="text-[8px] bg-green-50 border border-green-200 text-green-800 px-1.5 py-0.5 uppercase tracking-wide font-bold">Free Gift</span>
                    )}
                    {product.warranty && (
                      <span className="text-[8px] bg-[#F8F8F6] border border-[#E2E2DF] text-[#666666] px-1.5 py-0.5 uppercase tracking-wide">Warranty</span>
                    )}
                  </div>

                  <p className="text-xs text-[#666666] leading-relaxed line-clamp-2 mb-3">
                    {product.description}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {product.specifications.slice(0, 2).map((spec, index) => (
                      <span
                        key={index}
                        className="text-[8px] bg-white border border-[#E2E2DF] text-[#666666] px-1.5 py-0.5 uppercase tracking-wide"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E2E2DF] mt-4">
                  <a
                    href={`https://wa.me/${sc.whatsapp}?text=${encodeURIComponent(
                      `Hi ${STATIC_CONTENT.ownerName}, I am interested in buying the ${product.brand} ${product.name} listed on your website. Is this item currently in stock?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#7A2E2E] hover:bg-[#5F2222] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    <MessageSquare size={12} />
                    WhatsApp Enquiry
                  </a>
                </div>
              </div>
            ))}
          </div>

          {(homeTab === "featured" ? featuredProducts : newArrivals).length === 0 && (
            <div className="text-center py-12 bg-[#F8F8F6] border border-[#E2E2DF]">
              <Package size={32} className="mx-auto text-[#CCCCCC] mb-3" />
              <p className="text-[#666666] text-sm">No products in this section yet. Add products from the Admin Panel.</p>
            </div>
          )}
        </div>
      </section>

      {/* 6. Offers & Deals (Dynamic — only shown when admin has enabled offers) */}
      {activeOffers.length > 0 && (
        <section className="py-24 bg-[#F8F8F6] border-b border-[#E2E2DF]">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="max-w-2xl mb-16">
              <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">SPECIAL DEALS</span>
              <h2 className="text-3xl font-extrabold text-[#222222] mt-2">Current Offers &amp; Promotions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {activeOffers.map((offer) => {
                const colours = OFFER_COLOURS[offer.type] ?? { bg: "bg-[#F8F8F6]", text: "text-[#8A6A44]", border: "border-[#E2E2DF]" };
                return (
                  <motion.div
                    key={offer.id}
                    whileHover={{ y: -5 }}
                    className="bg-white border border-[#E2E2DF] flex flex-col overflow-hidden group"
                  >
                    {offer.image && (
                      <div className="w-full border-b border-[#E2E2DF] bg-[#F8F8F6] p-6 flex items-center justify-center h-[160px] overflow-hidden">
                        <img
                          src={offer.image}
                          alt={offer.title}
                          className="h-full w-auto object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <div className="p-7 flex flex-col gap-3 flex-1">
                      <span className={`self-start px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${colours.bg} ${colours.text} ${colours.border}`}>
                        <Tag size={8} className="inline mr-1" />{offer.type}
                      </span>
                      <h3 className="text-lg font-bold text-[#222222]">{offer.title}</h3>
                      <p className="text-sm text-[#666666] leading-relaxed flex-1">{offer.description}</p>
                      {offer.terms && (
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#8A6A44] border-t border-[#E2E2DF] pt-3">
                          T&amp;C: {offer.terms}
                        </p>
                      )}
                      {(offer.startDate || offer.endDate) && (
                        <p className="text-[9px] text-[#999999] font-semibold flex items-center gap-1">
                          <Clock size={10} />
                          {offer.startDate ? `From ${offer.startDate}` : ""}{offer.startDate && offer.endDate ? " – " : ""}{offer.endDate ? `Until ${offer.endDate}` : ""}
                        </p>
                      )}
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7A2E2E] hover:bg-[#5F2222] text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
                      >
                        <MessageSquare size={11} />
                        Enquire About This Offer
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 7. Why Choose Us */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-2xl mb-16">
            <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">{STATIC_CONTENT.whyLabel}</span>
            <h2 className="text-3xl font-extrabold text-[#222222] mt-2">{STATIC_CONTENT.whyHeading}</h2>
            <p className="text-[#666666] text-sm mt-4 leading-relaxed">{STATIC_CONTENT.whyDescription}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-[#E2E2DF] pt-12">
            {STATIC_CONTENT.whyCards.map((card, i) => (
              <div key={i} className="flex flex-col items-start gap-4">
                <div className="w-12 h-12 rounded-sm bg-[#F8F8F6] border border-[#E2E2DF] flex items-center justify-center text-[#7A2E2E]">
                  {iconMap[card.icon] || <Sparkles size={22} />}
                </div>
                <h3 className="text-lg font-bold text-[#222222] mt-2">{card.title}</h3>
                <p className="text-sm text-[#666666] leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Reviews */}
      <section className="py-24 bg-[#F8F8F6] border-y border-[#E2E2DF]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-lg mb-16">
            <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">{STATIC_CONTENT.reviewsLabel}</span>
            <h2 className="text-3xl font-extrabold text-[#222222] mt-2">{STATIC_CONTENT.reviewsHeading}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STATIC_CONTENT.reviews.map((rev, i) => (
              <motion.div
                key={rev.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-white border border-[#E2E2DF] p-8 flex flex-col justify-between min-h-[220px]"
              >
                <p className="text-[#222222] font-medium text-sm leading-relaxed italic">&ldquo;{rev.quote}&rdquo;</p>
                <div className="pt-6 border-t border-[#E2E2DF] mt-6 flex justify-between items-center">
                  <span className="text-xs font-bold text-[#222222] uppercase tracking-wide">{rev.author}</span>
                  <span className="text-[10px] font-bold text-[#8A6A44] uppercase tracking-widest">{rev.location}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Shop Gallery (Dynamic from Admin Panel) */}
      {sortedGallery.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">{STATIC_CONTENT.galleryLabel}</span>
                <h2 className="text-3xl font-extrabold text-[#222222] mt-2">{STATIC_CONTENT.galleryHeading}</h2>
              </div>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#7A2E2E] hover:text-[#5F2222] uppercase tracking-widest flex items-center gap-1.5">
                Ask About Availability
                <ArrowRight size={13} />
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {sortedGallery.map((item) => (
                <motion.div key={item.id} whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }} className="relative aspect-square border border-[#E2E2DF] bg-[#F8F8F6] overflow-hidden group">
                  <img src={item.imageUrl} alt={item.category} className="w-full h-full object-cover transition-all duration-500" loading="lazy" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent py-3 px-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-[8px] text-white font-bold uppercase tracking-wide">{item.category}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10. Contact CTA & Maps */}
      <section className="bg-white border-t border-[#E2E2DF] pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col items-start">
            <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase mb-4">VISIT US IN STORE</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#222222] tracking-tight leading-tight mb-6">
              Come Visit Maa Radio Today
            </h2>
            <p className="text-[#666666] text-sm leading-relaxed mb-8">
              Call us, message on WhatsApp, or visit the store directly. Our team is ready to help you find the perfect product.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-[#7A2E2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5F2222] transition-colors">
                <MessageSquare size={16} /> Chat on WhatsApp
              </a>
              <a href={`tel:${sc.phone}`} className="inline-flex items-center justify-center gap-3 px-6 py-4 border border-[#E2E2DF] text-[#222222] text-xs font-bold uppercase tracking-wider hover:border-[#222222] transition-colors">
                <Phone size={16} /> Call {sc.phone}
              </a>
            </div>
            <div className="flex items-center gap-3 mt-8 text-xs text-[#666666]">
              <MapPin size={16} className="text-[#8A6A44]" />
              <span>{STATIC_CONTENT.address} · {sc.hours}</span>
            </div>
          </div>

          <div className="lg:col-span-7 border border-[#E2E2DF] bg-[#F8F8F6] p-3 aspect-video relative overflow-hidden">
            <iframe
              src={sc.mapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, filter: "grayscale(1) contrast(1.1)" }}
              allowFullScreen
              loading="lazy"
              title="Maa Radio Store Location"
              className="w-full h-full min-h-[300px]"
            />
          </div>
        </div>
      </section>

    </div>
  );
}
