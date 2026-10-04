import React from "react";
import Link from "next/link";
import Logo from "./Logo";
import { Phone, MessageSquare, ShieldCheck, MapPin, Smartphone, Award, Clock } from "lucide-react";
import { fetchSiteContent } from "@/lib/apiClient";
import { STATIC_CONTENT } from "@/data/siteContent";

// Footer fetches live dynamic data from Supabase (Server Component).
// Static text (businessName, address, ownerName, tagline) comes from STATIC_CONTENT.
export default async function Footer() {
  const sc = await fetchSiteContent();
  const currentYear = new Date().getFullYear();

  // Build category links from admin-defined categories
  const sortedCategories = [...sc.categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 mt-auto pt-20 pb-12 relative overflow-hidden">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 relative z-10">

        {/* Brand Column */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <Link href="/" className="focus:outline-none inline-block">
            <Logo size="md" />
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm" id="footer-tagline">
            {STATIC_CONTENT.footerTagline}
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-400">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>100% Genuine Certified</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-medium text-sky-400">
              <Smartphone size={14} className="text-sky-400" />
              <span>Official Warranty</span>
            </div>
          </div>
        </div>

        {/* Sitemap */}
        <div className="md:col-span-2 flex flex-col gap-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Explore</h4>
          <ul className="flex flex-col gap-3">
            {["Home", "Products", "Accessories", "About", "Contact"].map((item) => (
              <li key={item}>
                <Link
                  href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {item}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/spin"
                className="text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors flex items-center gap-1.5"
              >
                <span>Spin &amp; Win</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-md">Live</span>
              </Link>
            </li>
            <li>
              <Link href="/admin" className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-medium">
                Owner Portal
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories (dynamic from admin) */}
        <div className="md:col-span-2 flex flex-col gap-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Categories</h4>
          <ul className="flex flex-col gap-3">
            {sortedCategories.length === 0 ? (
              <li className="text-sm text-slate-500 italic">No categories yet</li>
            ) : (
              sortedCategories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={cat.name === "Accessories" ? "/accessories" : `/products?category=${encodeURIComponent(cat.name)}`}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Store Info */}
        <div className="md:col-span-3 flex flex-col gap-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Store Info</h4>
          <ul className="flex flex-col gap-4">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-sky-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-300 leading-snug">
                <strong className="text-white">{STATIC_CONTENT.businessName}</strong><br />
                <span className="text-slate-400">{STATIC_CONTENT.address}</span>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-sky-400 flex-shrink-0" />
              <a href={`tel:${sc.phone.replace(/\s/g, "")}`} className="text-sm text-slate-300 hover:text-white transition-colors">
                {sc.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MessageSquare size={16} className="text-emerald-400 flex-shrink-0" />
              <a href={`https://wa.me/${sc.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                Chat on WhatsApp
              </a>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-16 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500 tracking-wide text-center sm:text-left">
          © {currentYear} {STATIC_CONTENT.businessName}. All Rights Reserved.
        </p>
        <p className="text-xs text-slate-500 tracking-wider uppercase font-medium text-center sm:text-right">
          Managed by <span className="text-slate-300 font-semibold">{STATIC_CONTENT.ownerName}</span>
        </p>
      </div>
    </footer>
  );
}
