"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, ShieldCheck, HeartHandshake,
  Sparkles, Phone, MessageSquare, MapPin,
  Gift, CreditCard, Wrench, Star, Layers
} from "lucide-react";
import { SiteContent, DEFAULT_SITE_CONTENT } from "@/data/siteContent";
import { fetchSiteContent } from "@/lib/apiClient";

export default function HomePage() {
  const [sc, setSc] = useState<SiteContent>(DEFAULT_SITE_CONTENT);

  useEffect(() => {
    fetchSiteContent().then(setSc);
  }, []);

  const whatsappLink = `https://wa.me/${sc.whatsapp}`;
  const heroEnquireLink = `https://wa.me/${sc.whatsapp}?text=${encodeURIComponent(
    `Hi ${sc.ownerName}, I am interested in the ${sc.heroProductName} listed on your website.`
  )}`;

  const iconMap: Record<string, React.ReactNode> = {
    shield: <ShieldCheck size={22} />,
    handshake: <HeartHandshake size={22} />,
    message: <MessageSquare size={22} />,
    gift: <Gift size={22} />,
    "credit-card": <CreditCard size={22} />,
    wrench: <Wrench size={22} />,
    star: <Star size={22} />,
  };

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
              <span>{sc.heroBadge}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#222222] leading-[1.1] mb-6 text-pretty"
            >
              {sc.heroHeading} <br />
              <span className="text-[#7A2E2E]">{sc.heroHeadingAccent}.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-[#666666] text-base md:text-lg leading-relaxed mb-8 max-w-md text-pretty"
            >
              {sc.heroBody}
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
                {sc.heroCTAPrimary}
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[#E2E2DF] hover:border-[#222222] text-[#222222] text-xs font-bold tracking-wider uppercase transition-colors"
              >
                {sc.heroCTASecondary}
              </Link>
            </motion.div>
          </div>

          {/* Hero Right — Featured Product Card */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="relative w-full max-w-[460px] aspect-[4/5] bg-[#F8F8F6] border border-[#E2E2DF] p-8 md:p-12 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">
                    {sc.heroFeaturedLabel}
                  </span>
                  <h3 className="text-xl font-bold text-[#222222] mt-1">{sc.heroProductName}</h3>
                </div>
                <span className="text-sm font-semibold text-[#7A2E2E]">{sc.heroProductPrice}</span>
              </div>

              <div className="my-auto relative flex justify-center items-center">
                <div className="absolute w-[240px] h-[240px] bg-[#8A6A44]/5 rounded-full blur-3xl -z-10" />
                <img
                  src={sc.heroProductImage}
                  alt={sc.heroProductName}
                  className="w-auto h-[260px] object-contain drop-shadow-[0_20px_40px_rgba(34,34,34,0.15)] hover:scale-105 transition-transform duration-500"
                  loading="eager"
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[#E2E2DF]">
                <span className="text-xs text-[#666666]">{sc.heroProductVariant}</span>
                <a
                  href={heroEnquireLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#7A2E2E] hover:text-[#5F2222] uppercase tracking-wider flex items-center gap-1.5"
                >
                  {sc.heroEnquireLabel}
                  <ArrowRight size={12} />
                </a>
              </div>
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
            {sc.philosophyLabel}
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl font-light text-[#222222] leading-snug text-pretty"
            dangerouslySetInnerHTML={{ __html: `"${sc.philosophyQuote}"` }}
          />
        </div>
      </section>

      {/* 3. Featured Categories (Asymmetrical Grid) */}
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

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <motion.div whileHover={{ y: -5 }} className="md:col-span-7 bg-[#F8F8F6] border border-[#E2E2DF] min-h-[400px] p-10 flex flex-col justify-between group relative overflow-hidden">
              <div className="flex justify-between items-start z-10">
                <div>
                  <span className="text-[10px] font-mono text-[#8A6A44] font-bold">01 / MOBILES</span>
                  <h3 className="text-2xl font-bold text-[#222222] mt-2">Smartphones</h3>
                  <p className="text-[#666666] text-sm mt-2 max-w-xs">Latest smartphones from Samsung, Apple, Vivo, Oppo, Realme and more. Genuine products with warranty and trusted support.</p>
                </div>
              </div>
              <div className="relative self-end w-full max-w-[320px] aspect-[4/3] flex items-center justify-center z-10 mt-8">
                <img src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=500&auto=format&fit=crop" alt="Smartphones" className="w-auto h-[220px] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.08)] group-hover:scale-105 transition-transform duration-500" />
              </div>
              <Link href="/products?category=Smartphones" className="absolute inset-0 z-20" />
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="md:col-span-5 bg-[#F8F8F6] border border-[#E2E2DF] min-h-[400px] p-10 flex flex-col justify-between group relative overflow-hidden">
              <div className="z-10">
                <span className="text-[10px] font-mono text-[#8A6A44] font-bold">02 / CATALOGUE</span>
                <h3 className="text-2xl font-bold text-[#222222] mt-2">Accessories</h3>
                <p className="text-[#666666] text-sm mt-2 max-w-xs">Cases, adapters, premium cables and protection.</p>
              </div>
              <div className="relative self-center w-full max-w-[240px] aspect-square flex items-center justify-center z-10 mt-8">
                <img src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=400&auto=format&fit=crop" alt="Accessories" className="w-auto h-[180px] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.08)] group-hover:scale-105 transition-transform duration-500" />
              </div>
              <Link href="/accessories" className="absolute inset-0 z-20" />
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="md:col-span-4 bg-[#F8F8F6] border border-[#E2E2DF] min-h-[350px] p-8 flex flex-col justify-between group relative overflow-hidden">
              <div className="z-10">
                <span className="text-[10px] font-mono text-[#8A6A44] font-bold">03 / SOUND</span>
                <h3 className="text-xl font-bold text-[#222222] mt-1.5">Audio Gear</h3>
                <p className="text-[#666666] text-xs mt-1">Noise cancelling headphones & spatial earbuds.</p>
              </div>
              <div className="relative self-center w-full max-w-[200px] h-[150px] flex items-center justify-center z-10 my-4">
                <img src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=400&auto=format&fit=crop" alt="Audio" className="w-auto h-[140px] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.08)] group-hover:scale-105 transition-transform duration-500" />
              </div>
              <Link href="/products?category=Audio" className="absolute inset-0 z-20" />
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="md:col-span-4 bg-[#F8F8F6] border border-[#E2E2DF] min-h-[350px] p-8 flex flex-col justify-between group relative overflow-hidden">
              <div className="z-10">
                <span className="text-[10px] font-mono text-[#8A6A44] font-bold">04 / WEARABLES</span>
                <h3 className="text-xl font-bold text-[#222222] mt-1.5">Smart Watches</h3>
                <p className="text-[#666666] text-xs mt-1">Advanced health trackers and luxury bezels.</p>
              </div>
              <div className="relative self-center w-full max-w-[200px] h-[150px] flex items-center justify-center z-10 my-4">
                <img src="https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=400&auto=format&fit=crop" alt="Smart Watches" className="w-auto h-[140px] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.08)] group-hover:scale-105 transition-transform duration-500" />
              </div>
              <Link href="/products?category=Smart%20Watches" className="absolute inset-0 z-20" />
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="md:col-span-4 bg-[#F8F8F6] border border-[#E2E2DF] min-h-[350px] p-8 flex flex-col justify-between group relative overflow-hidden">
              <div className="z-10">
                <span className="text-[10px] font-mono text-[#8A6A44] font-bold">05 / HOME</span>
                <h3 className="text-xl font-bold text-[#222222] mt-1.5">Appliances</h3>
                <p className="text-[#666666] text-xs mt-1">Intelligent vacuums and smart culinary tools.</p>
              </div>
              <div className="relative self-center w-full max-w-[200px] h-[150px] flex items-center justify-center z-10 my-4">
                <img src="https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?q=80&w=400&auto=format&fit=crop" alt="Home Appliances" className="w-auto h-[130px] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.08)] group-hover:scale-105 transition-transform duration-500" />
              </div>
              <Link href="/products?category=Home%20Appliances" className="absolute inset-0 z-20" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Brand Marquee */}
      <section className="py-16 bg-[#F8F8F6] border-y border-[#E2E2DF] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 mb-8">
          <span className="text-[9px] font-bold tracking-widest text-[#8A6A44] uppercase">{sc.brandsLabel}</span>
        </div>
        <div className="flex w-[200%] gap-16 md:gap-32 animate-marquee whitespace-nowrap">
          {[...sc.brands, ...sc.brands].map((brand, i) => (
            <span key={i} className="text-2xl md:text-3xl font-extrabold tracking-wider text-[#222222]/30 hover:text-[#7A2E2E] transition-colors cursor-default uppercase">
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* 4.5. Promotions, Combos, EMI, Gifts */}
      {(sc.offers?.length > 0 || sc.comboDeals?.length > 0 || sc.gifts?.length > 0 || sc.emiOffers?.length > 0) && (
        <section className="py-24 bg-white border-b border-[#E2E2DF]">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            
            {/* Offers */}
            {sc.offers?.length > 0 && (
              <div className="mb-20">
                <div className="max-w-2xl mb-12">
                  <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">{sc.offersLabel}</span>
                  <h2 className="text-3xl font-extrabold text-[#222222] mt-2">{sc.offersHeading}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {sc.offers.map((offer) => (
                    <motion.div key={offer.id} whileHover={{ y: -5 }} className="bg-[#F8F8F6] border border-[#E2E2DF] flex flex-col sm:flex-row overflow-hidden group">
                      {offer.image && (
                        <div className="w-full sm:w-2/5 shrink-0 border-b sm:border-b-0 sm:border-r border-[#E2E2DF] bg-white p-6 flex items-center justify-center">
                          <img src={offer.image} alt={offer.title} className="w-full h-auto object-contain max-h-[160px] group-hover:scale-105 transition-transform" />
                        </div>
                      )}
                      <div className="p-8 flex flex-col justify-center w-full">
                        <h3 className="text-xl font-bold text-[#222222] mb-2">{offer.title}</h3>
                        <p className="text-[#666666] text-sm mb-4 leading-relaxed">{offer.description}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#8A6A44]">{offer.terms}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Combo Deals */}
              {sc.comboDeals?.length > 0 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">{sc.comboDealsLabel}</span>
                    <h3 className="text-2xl font-bold text-[#222222] mt-1">{sc.comboDealsHeading}</h3>
                  </div>
                  {sc.comboDeals.map((combo) => (
                    <div key={combo.id} className="border border-[#E2E2DF] p-6 bg-[#F8F8F6]">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-[#222222]">{combo.title}</h4>
                        <span className="text-sm font-bold text-[#7A2E2E]">{combo.price}</span>
                      </div>
                      <p className="text-xs text-[#666666] mb-3 leading-relaxed">{combo.description}</p>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-[#8A6A44] flex items-center gap-1.5"><Layers size={12} /> {combo.items}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Free Gifts */}
              {sc.gifts?.length > 0 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">{sc.giftsLabel}</span>
                    <h3 className="text-2xl font-bold text-[#222222] mt-1">{sc.giftsHeading}</h3>
                  </div>
                  {sc.gifts.map((gift) => (
                    <div key={gift.id} className="border border-[#E2E2DF] p-6 bg-[#F8F8F6]">
                      <h4 className="font-bold text-[#222222] mb-2">{gift.title}</h4>
                      <p className="text-xs text-[#666666] mb-3 leading-relaxed">{gift.description}</p>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-[#7A2E2E] flex items-center gap-1.5"><Gift size={12} /> {gift.conditions}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* EMI */}
              {sc.emiOffers?.length > 0 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">{sc.emiLabel}</span>
                    <h3 className="text-2xl font-bold text-[#222222] mt-1">{sc.emiHeading}</h3>
                  </div>
                  {sc.emiOffers.map((emi) => (
                    <div key={emi.id} className="border border-[#E2E2DF] p-6 bg-[#F8F8F6]">
                      <h4 className="font-bold text-[#222222] mb-2">{emi.provider}</h4>
                      <p className="text-xs text-[#666666] mb-3 leading-relaxed">{emi.description}</p>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-[#8A6A44] flex items-center gap-1.5"><CreditCard size={12} /> {emi.plan}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </section>
      )}

      {/* 5. Why Choose Us */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-2xl mb-16">
            <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">{sc.whyLabel}</span>
            <h2 className="text-3xl font-extrabold text-[#222222] mt-2">{sc.whyHeading}</h2>
            {sc.whyDescription && (
              <p className="text-[#666666] text-sm mt-4 leading-relaxed">{sc.whyDescription}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-[#E2E2DF] pt-12">
            {sc.whyCards.map((card, i) => (
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

      {/* 6. Reviews */}
      <section className="py-24 bg-[#F8F8F6] border-y border-[#E2E2DF]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-lg mb-16">
            <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">{sc.reviewsLabel}</span>
            <h2 className="text-3xl font-extrabold text-[#222222] mt-2">{sc.reviewsHeading}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sc.reviews.map((rev, i) => (
              <motion.div
                key={rev.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-white border border-[#E2E2DF] p-8 flex flex-col justify-between min-h-[220px]"
              >
                <p className="text-[#222222] font-medium text-sm leading-relaxed italic">"{rev.quote}"</p>
                <div className="pt-6 border-t border-[#E2E2DF] mt-6 flex justify-between items-center">
                  <span className="text-xs font-bold text-[#222222] uppercase tracking-wide">{rev.author}</span>
                  <span className="text-[10px] font-bold text-[#8A6A44] uppercase tracking-widest">{rev.location}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Gallery */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">{sc.galleryLabel}</span>
              <h2 className="text-3xl font-extrabold text-[#222222] mt-2">{sc.galleryHeading}</h2>
            </div>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#7A2E2E] hover:text-[#5F2222] uppercase tracking-widest flex items-center gap-1.5">
              Ask About Availability
              <ArrowRight size={13} />
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {sc.gallery.filter(Boolean).map((src, i) => (
              <motion.div key={i} whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }} className="relative aspect-square border border-[#E2E2DF] bg-[#F8F8F6] overflow-hidden">
                <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500" loading="lazy" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Contact CTA & Maps */}
      <section className="bg-white border-t border-[#E2E2DF] pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col items-start">
            <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase mb-4">{sc.contactCtaLabel}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#222222] tracking-tight leading-tight mb-6">{sc.contactCtaHeading}</h2>
            <p className="text-[#666666] text-sm leading-relaxed mb-8">{sc.contactCtaBody}</p>
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
              <span>{sc.address} • Owner: {sc.ownerName}</span>
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
