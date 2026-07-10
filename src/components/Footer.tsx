import React from "react";
import Link from "next/link";
import Logo from "./Logo";
import { Phone, MessageSquare, ShieldCheck, MapPin } from "lucide-react";
import { DEFAULT_SITE_CONTENT } from "@/data/siteContent";

// Footer reads from DEFAULT_SITE_CONTENT at build time.
// The public website uses a client-side SiteContentFooter wrapper
// that hydrates from localStorage on the browser.
// This keeps the footer SEO-renderable without a client boundary.
export default function Footer() {
  const sc = DEFAULT_SITE_CONTENT;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#F8F8F6] border-t border-border mt-auto pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">

        {/* Brand Column */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <Link href="/" className="focus:outline-none">
            <Logo size="md" />
          </Link>
          <p className="text-[#666666] text-sm leading-relaxed max-w-sm" id="footer-tagline">
            {sc.footerTagline}
          </p>
          <div className="flex items-center gap-3 text-[#8A6A44] text-xs font-semibold uppercase tracking-wider mt-2">
            <ShieldCheck size={16} />
            <span>100% Genuine Products Only</span>
          </div>
        </div>

        {/* Sitemap */}
        <div className="md:col-span-2 flex flex-col gap-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#222222]">Explore</h4>
          <ul className="flex flex-col gap-3">
            {["Home", "Products", "Accessories", "About", "Contact"].map((item) => (
              <li key={item}>
                <Link href={item === "Home" ? "/" : `/${item.toLowerCase()}`} className="text-sm text-[#666666] hover:text-[#7A2E2E] transition-colors">
                  {item}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/admin" className="text-xs text-[#8A6A44] hover:text-[#7A2E2E] transition-colors font-medium">
                Owner Portal
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div className="md:col-span-2 flex flex-col gap-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#222222]">Categories</h4>
          <ul className="flex flex-col gap-3">
            {["Smartphones", "Accessories", "Audio", "Smart Watches", "Home Appliances"].map((cat) => (
              <li key={cat}>
                <Link href={`/products?category=${encodeURIComponent(cat)}`} className="text-sm text-[#666666] hover:text-[#7A2E2E] transition-colors">
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Store Info */}
        <div className="md:col-span-3 flex flex-col gap-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#222222]">Store Info</h4>
          <ul className="flex flex-col gap-4">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-[#8A6A44] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-[#666666] leading-snug">
                <strong>{sc.businessName}</strong><br />
                {sc.address}
              </div>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-[#8A6A44] flex-shrink-0" />
              <a href={`tel:${sc.phone.replace(/\s/g, "")}`} className="text-sm text-[#666666] hover:text-[#7A2E2E] transition-colors">
                {sc.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MessageSquare size={16} className="text-[#8A6A44] flex-shrink-0" />
              <a href={`https://wa.me/${sc.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[#666666] hover:text-[#7A2E2E] transition-colors">
                Chat on WhatsApp
              </a>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[#666666] tracking-wide text-center sm:text-left">
          © {currentYear} {sc.businessName}. Designed with dedication. All Rights Reserved.
        </p>
        <p className="text-xs text-[#8A6A44] tracking-wider uppercase font-semibold text-center sm:text-right">
          Managed by {sc.ownerName}
        </p>
      </div>
    </footer>
  );
}
