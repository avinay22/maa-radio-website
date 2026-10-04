"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, PhoneCall, Sparkles } from "lucide-react";
import Logo from "./Logo";
import { fetchSiteContent } from "@/lib/apiClient";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Accessories", href: "/accessories" },
  { name: "Spin & Win 🎁", href: "/spin", isSpecial: true },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [whatsapp, setWhatsapp] = useState("917002733658");
  const [phone, setPhone] = useState("+91 70027 33658");

  useEffect(() => {
    fetchSiteContent().then((sc) => {
      setWhatsapp(sc.whatsapp);
      setPhone(sc.phone);
    });
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs py-3.5"
            : "bg-white/60 backdrop-blur-md border-b border-slate-200/40 py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link href="/" className="focus:outline-none hover:opacity-90 transition-opacity">
            <Logo size="md" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[13px] font-semibold tracking-wide transition-all relative py-1 focus:outline-none flex items-center gap-1.5 ${
                    link.isSpecial
                      ? "text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 px-3 py-1 rounded-full shadow-xs"
                      : isActive
                      ? "text-[#7A2E2E]"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {link.name}
                  {isActive && !link.isSpecial && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7A2E2E] rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden md:flex items-center">
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#7A2E2E] to-[#9E3838] hover:from-[#5F2222] hover:to-[#7A2E2E] text-white text-xs font-bold tracking-wider uppercase rounded-full shadow-md shadow-[#7A2E2E]/20 hover:shadow-lg hover:shadow-[#7A2E2E]/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              <PhoneCall size={13} />
              Enquire Now
            </a>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-800 hover:text-[#7A2E2E] rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 top-[68px] z-40 bg-white/95 backdrop-blur-2xl border-t border-slate-200/80 flex flex-col md:hidden"
          >
            <div className="flex-1 flex flex-col justify-center px-8 py-10 gap-6">
              {navLinks.map((link, idx) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-lg font-bold tracking-wide transition-colors block py-2 ${
                        link.isSpecial
                          ? "text-amber-900 bg-amber-50 border border-amber-300 px-4 py-2 rounded-2xl w-fit"
                          : isActive
                          ? "text-[#7A2E2E]"
                          : "text-slate-800"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}

              <div className="pt-6 border-t border-slate-200 flex flex-col gap-3">
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-gradient-to-r from-[#7A2E2E] to-[#9E3838] text-white text-xs font-bold uppercase tracking-wider rounded-xl text-center shadow-md flex items-center justify-center gap-2"
                >
                  <PhoneCall size={14} />
                  Chat on WhatsApp
                </a>
                <a
                  href={`tel:${phone}`}
                  className="w-full py-3.5 border border-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl text-center flex items-center justify-center gap-2"
                >
                  Call Store: {phone}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
