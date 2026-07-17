"use client";

import React from "react";
import { ShieldCheck, HeartHandshake, Compass, Users } from "lucide-react";
import { STATIC_CONTENT } from "@/data/siteContent";

export default function AboutPage() {
  return (
    <div className="bg-white pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-[#E2E2DF] pb-16 mb-20 items-center">
          <div className="lg:col-span-7">
            <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">{STATIC_CONTENT.aboutTagline}</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#222222] mt-3 leading-tight text-pretty">
              {STATIC_CONTENT.aboutHeading} <br />
              <span className="text-[#7A2E2E]">{STATIC_CONTENT.aboutHeadingAccent}.</span>
            </h1>
            <p className="text-[#666666] text-base md:text-lg leading-relaxed mt-6 max-w-xl text-pretty">
              {STATIC_CONTENT.aboutIntro}
            </p>
          </div>
          <div className="lg:col-span-5 bg-[#F8F8F6] border border-[#E2E2DF] p-8">
            <span className="text-[9px] font-bold text-[#8A6A44] uppercase tracking-widest block mb-2">Identity</span>
            <div className="text-2xl font-extrabold text-[#222222] tracking-tight">{STATIC_CONTENT.ownerName}</div>
            <div className="text-xs font-semibold text-[#7A2E2E] uppercase tracking-wider mt-1">{STATIC_CONTENT.aboutOwnerTitle}</div>
            <p className="text-xs text-[#666666] leading-relaxed mt-4">{STATIC_CONTENT.aboutOwnerQuote}</p>
          </div>
        </div>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start mb-24">
          <div className="lg:col-span-5 border-l-2 border-[#7A2E2E] pl-6 md:pl-8 py-2">
            <h2 className="text-xl sm:text-2xl font-light text-[#222222] leading-relaxed italic text-pretty">
              &ldquo;{STATIC_CONTENT.aboutQuote}&rdquo;
            </h2>
            <div className="text-xs font-bold uppercase tracking-widest text-[#8A6A44] mt-6">
              — {STATIC_CONTENT.ownerName}
            </div>
          </div>
          <div className="lg:col-span-7 space-y-6 text-[#666666] text-sm leading-relaxed">
            <p>{STATIC_CONTENT.aboutParagraph1}</p>
            <p>{STATIC_CONTENT.aboutParagraph2}</p>
            <p>{STATIC_CONTENT.aboutParagraph3}</p>
          </div>
        </div>

        {/* Pillars */}
        <div className="border-t border-[#E2E2DF] pt-20">
          <div className="max-w-xl mb-16">
            <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">Core Principles</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#222222] mt-2">What We Stand For</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { Icon: ShieldCheck, title: "Authenticity", desc: "Zero tolerance for counterfeits. Every item is verified original from the brand." },
              { Icon: HeartHandshake, title: "Owner Integrity", desc: `${STATIC_CONTENT.ownerName} stands behind every sale, assisting personally with setups and claims.` },
              { Icon: Compass, title: "Curated Range", desc: "We don't stock thousands of low-grade items. We select the best performers in each category." },
              { Icon: Users, title: "Local Trust", desc: "Building deep relationships with local families, supplying technology that lasts." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="bg-[#F8F8F6] border border-[#E2E2DF] p-8 flex flex-col justify-between min-h-[200px]">
                <div className="text-[#7A2E2E]"><Icon size={26} /></div>
                <div className="mt-8">
                  <h4 className="text-sm font-bold text-[#222222] uppercase tracking-wide">{title}</h4>
                  <p className="text-xs text-[#666666] leading-relaxed mt-2">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
