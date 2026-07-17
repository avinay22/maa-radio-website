"use client";

import React, { useState, useEffect } from "react";
import { Phone, MessageSquare, Mail, MapPin, Clock, Shield } from "lucide-react";
import { SiteContent, DEFAULT_SITE_CONTENT, STATIC_CONTENT } from "@/data/siteContent";
import { fetchSiteContent } from "@/lib/apiClient";

export default function ContactPage() {
  const [sc, setSc] = useState<SiteContent>(DEFAULT_SITE_CONTENT);

  useEffect(() => {
    fetchSiteContent().then(setSc);
  }, []);

  return (
    <div className="bg-white pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        <div className="border-b border-[#E2E2DF] pb-10 mb-16">
          <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">
            Store Location &amp; Contact
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#222222] mt-2">VISIT MAA RADIO TODAY</h1>
          <p className="text-[#666666] text-sm mt-4 max-w-xl">
            Whether you want to check stock availability, request home delivery, or ask about custom accessories, we are ready to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-10">
            <div className="bg-[#F8F8F6] border border-[#E2E2DF] p-8">
              <span className="text-[9px] font-bold text-[#8A6A44] uppercase tracking-widest block mb-1">
                Store Administrator
              </span>
              <h3 className="text-xl font-bold text-[#222222]">{STATIC_CONTENT.ownerName}</h3>
              <p className="text-xs text-[#666666] mt-2">
                {STATIC_CONTENT.ownerName} manages the operations, handles individual product sourcing queries, and oversees technical verification.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#F8F8F6] border border-[#E2E2DF] flex items-center justify-center text-[#7A2E2E] flex-shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#222222]">Phone Call</h4>
                  <a href={`tel:${sc.phone.replace(/\s/g, "")}`} className="text-base font-semibold text-[#666666] hover:text-[#7A2E2E] transition-colors mt-1 block">
                    {sc.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#F8F8F6] border border-[#E2E2DF] flex items-center justify-center text-[#7A2E2E] flex-shrink-0">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#222222]">WhatsApp Chat</h4>
                  <a href={`https://wa.me/${sc.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-base font-semibold text-[#666666] hover:text-[#7A2E2E] transition-colors mt-1 block">
                    {sc.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#F8F8F6] border border-[#E2E2DF] flex items-center justify-center text-[#666666] flex-shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#222222]">Email Address</h4>
                  <span className="text-base font-semibold text-[#999999] mt-1 block">Not Available</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#F8F8F6] border border-[#E2E2DF] flex items-center justify-center text-[#7A2E2E] flex-shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#222222]">Store Hours</h4>
                  <span className="text-sm font-semibold text-[#666666] mt-1 block">{sc.hours}</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#F8F8F6] border border-[#E2E2DF] flex items-center justify-center text-[#7A2E2E] flex-shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#222222]">Store Address</h4>
                  <span className="text-sm font-semibold text-[#666666] mt-1 block">{STATIC_CONTENT.address}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#8A6A44] font-semibold uppercase tracking-wider border-t border-[#E2E2DF] pt-8">
              <Shield size={16} />
              <span>Verified Direct-to-Owner Channels</span>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-7 space-y-4">
            <div className="border border-[#E2E2DF] p-3 bg-[#F8F8F6] aspect-video w-full overflow-hidden">
              <iframe
                src={sc.mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, filter: "grayscale(1) contrast(1.1)" }}
                allowFullScreen
                loading="lazy"
                title="Maa Radio Store Location"
                className="w-full min-h-[350px]"
              />
            </div>
            <div className="flex items-start gap-3 bg-[#F8F8F6] border border-[#E2E2DF] p-4">
              <MapPin className="text-[#8A6A44] mt-0.5 flex-shrink-0" size={18} />
              <p className="text-xs text-[#666666] leading-relaxed">
                <strong>Visit Us:</strong> {STATIC_CONTENT.address}. Call us if you need help finding the storefront.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
