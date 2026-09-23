"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MessageSquare, Phone, ShieldCheck, Gift,
  Zap, CreditCard, Sparkles, CheckCircle, AlertCircle,
  Package, ChevronLeft, ChevronRight, Share2, Check
} from "lucide-react";
import { Product } from "@/data/products";
import { SiteContent, DEFAULT_SITE_CONTENT, STATIC_CONTENT } from "@/data/siteContent";
import { fetchProducts, fetchSiteContent } from "@/lib/apiClient";
import ProductCard, { formatPrice, getDiscountBadge } from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [sc, setSc] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchSiteContent()]).then(([productList, siteContent]) => {
      setProducts(productList);
      setSc(siteContent);
      setLoading(false);
    });
  }, []);

  const product = products.find((p) => String(p.id) === String(productId)) ?? null;

  // Reset active image when product changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [productId]);

  const relatedProducts = products
    .filter((p) => String(p.id) !== String(productId) && p.category === product?.category)
    .slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#7A2E2E] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase font-bold tracking-wider text-[#666666]">
            Loading product details…
          </span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6 text-center py-20 border border-dashed border-[#E2E2DF] rounded-2xl bg-[#FAF9F6]">
          <Package size={52} className="mx-auto text-[#CCCCCC] mb-4" />
          <h1 className="text-2xl font-bold text-[#222222]">Product Not Found</h1>
          <p className="text-sm text-[#666666] mt-2 mb-6">
            The product you are looking for may have been removed or updated.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#7A2E2E] hover:bg-[#5F2222] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
          >
            <ArrowLeft size={14} /> Back to Products Catalog
          </Link>
        </div>
      </div>
    );
  }

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [];
  const activeImage = images[activeImageIndex] || "";

  const whatsappMessage = encodeURIComponent(
    `Hi ${STATIC_CONTENT.ownerName}, I am interested in ${product.brand} ${product.name} listed on your website. Is it available in stock?`
  );
  const whatsappUrl = `https://wa.me/${sc.whatsapp || "917002733658"}?text=${whatsappMessage}`;

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.brand} ${product.name} | Maa Radio`,
          text: `Check out the ${product.brand} ${product.name} at Maa Radio!`,
          url,
        });
      } catch {
        // Cancelled
      }
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const nextImage = () => {
    if (images.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between gap-4 border-b border-[#E2E2DF] pb-4 mb-8 text-xs">
          <div className="flex items-center gap-2 text-[#666666] flex-wrap">
            <Link href="/" className="hover:text-[#222222] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-[#222222] transition-colors">
              Products
            </Link>
            <span>/</span>
            <span className="text-[#222222] font-semibold">{product.name}</span>
          </div>

          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7A2E2E] hover:text-[#5F2222]"
          >
            <ArrowLeft size={13} /> Back
          </button>
        </div>

        {/* Main Product Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Left: Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full bg-[#FAF9F6] border border-[#E2E2DF] rounded-2xl flex items-center justify-center p-8 overflow-hidden group">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  className="max-h-[360px] w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="text-[#CCCCCC] flex flex-col items-center gap-2">
                  <Package size={64} />
                  <span className="text-xs text-[#999999]">No image available</span>
                </div>
              )}

              {/* Stock Status Badge */}
              <div className="absolute bottom-4 right-4">
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border shadow-xs flex items-center gap-1.5 ${
                    product.stockStatus === "In Stock" || product.stockStatus === "Limited Stock"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {product.stockStatus === "In Stock" ? (
                    <CheckCircle size={11} />
                  ) : (
                    <AlertCircle size={11} />
                  )}
                  {product.stockStatus}
                </span>
              </div>

              {/* Multiple Images Carousel Controls */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-[#222222] shadow-md border border-[#E2E2DF] transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-[#222222] shadow-md border border-[#E2E2DF] transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl border-2 p-1.5 bg-white overflow-hidden transition-all ${
                      activeImageIndex === idx
                        ? "border-[#7A2E2E] shadow-sm scale-102"
                        : "border-[#E2E2DF] hover:border-[#8A6A44] opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details & Buying Information */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-xs font-bold text-[#8A6A44] uppercase tracking-wider">
                  {product.brand} · {product.category}
                </span>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#222222] border border-[#E2E2DF] px-3 py-1.5 rounded-full hover:bg-[#FAF9F6] transition-colors"
                >
                  {copied ? <Check size={14} className="text-green-600" /> : <Share2 size={14} />}
                  <span>{copied ? "Link Copied" : "Share"}</span>
                </button>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#222222] tracking-tight leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Pricing Section */}
            <div className="p-6 bg-[#FAF9F6] border border-[#E2E2DF] rounded-2xl flex items-baseline gap-4 flex-wrap">
              {product.discountPrice ? (
                <>
                  <span className="text-3xl sm:text-4xl font-black text-[#111111]">
                    {formatPrice(product.discountPrice)}
                  </span>
                  <span className="text-base line-through text-[#888888] font-medium">
                    {formatPrice(product.originalPrice)}
                  </span>
                  {getDiscountBadge(product.originalPrice, product.discountPrice, product.discountPercentage) && (
                    <span className="bg-[#DC2626] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md ml-auto shadow-xs">
                      {getDiscountBadge(product.originalPrice, product.discountPrice, product.discountPercentage)}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-3xl sm:text-4xl font-black text-[#111111]">
                  {formatPrice(product.originalPrice) || "Price on request"}
                </span>
              )}
            </div>

            {/* Offers & Perks */}
            {(product.freeGift || product.comboOffer || product.cashbackOffer || product.emiAvailable || product.warranty || product.offersAndPromotions) && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#666666]">
                  Available Offers &amp; Benefits
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {product.emiAvailable && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 font-medium">
                      <CreditCard size={16} className="text-teal-700 flex-shrink-0" />
                      <span>Easy EMI Options Available</span>
                    </div>
                  )}
                  {product.warranty && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F8F8F6] border border-[#E2E2DF] text-[#444444] font-medium">
                      <ShieldCheck size={16} className="text-[#8A6A44] flex-shrink-0" />
                      <span>{product.warranty}</span>
                    </div>
                  )}
                  {product.freeGift && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-green-50 border border-green-200 text-green-900 font-medium sm:col-span-2">
                      <Gift size={16} className="text-green-700 flex-shrink-0" />
                      <span>Free Gift Included: {product.freeGift}</span>
                    </div>
                  )}
                  {product.comboOffer && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-medium sm:col-span-2">
                      <Zap size={16} className="text-blue-700 flex-shrink-0" />
                      <span>Combo Deal: {product.comboOffer}</span>
                    </div>
                  )}
                  {product.cashbackOffer && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 font-medium sm:col-span-2">
                      <Sparkles size={16} className="text-purple-700 flex-shrink-0" />
                      <span>Cashback: {product.cashbackOffer}</span>
                    </div>
                  )}
                  {product.offersAndPromotions && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-medium sm:col-span-2">
                      <Sparkles size={16} className="text-amber-700 flex-shrink-0" />
                      <span>Promotion: {product.offersAndPromotions}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#7A2E2E] hover:bg-[#5F2222] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <MessageSquare size={16} />
                Enquire on WhatsApp
              </a>
              <a
                href={`tel:${sc.phone}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 border border-[#E2E2DF] hover:border-[#222222] text-[#222222] text-xs font-bold uppercase tracking-wider rounded-xl transition-all hover:bg-[#FAF9F6]"
              >
                <Phone size={15} />
                Call {sc.phone}
              </a>
            </div>

            {/* Store Guarantee note */}
            <div className="p-4 bg-[#FAF9F6] border border-[#E2E2DF] rounded-xl text-xs text-[#666666] leading-relaxed">
              <span className="font-bold text-[#222222] block mb-1">Maa Radio Gogamukh Guarantee:</span>
              100% Genuine brand products, official invoice, manufacturer warranty support, and dedicated after-sales care.
            </div>

          </div>
        </div>

        {/* Detailed Information Tabs / Sections */}
        <div className="mt-16 pt-12 border-t border-[#E2E2DF] grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Description */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-base font-bold uppercase tracking-wider text-[#222222] border-b border-[#E2E2DF] pb-3">
              Product Description
            </h2>
            <p className="text-sm text-[#555555] leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Specifications */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-base font-bold uppercase tracking-wider text-[#222222] border-b border-[#E2E2DF] pb-3">
              Technical Specifications
            </h2>
            {Array.isArray(product.specifications) && product.specifications.length > 0 ? (
              <div className="bg-[#FAF9F6] border border-[#E2E2DF] rounded-2xl overflow-hidden divide-y divide-[#E2E2DF]">
                {product.specifications.map((spec, i) => (
                  <div key={i} className="px-5 py-3 text-xs flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#8A6A44] mt-1.5 flex-shrink-0" />
                    <span className="text-[#333333] font-medium leading-relaxed">{spec}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#888888] italic">No specifications listed for this product.</p>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-16 border-t border-[#E2E2DF]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">
                  SIMILAR OPTIONS
                </span>
                <h2 className="text-2xl font-extrabold text-[#222222] mt-1">
                  More in {product.category}
                </h2>
              </div>
              <Link
                href={`/products?category=${encodeURIComponent(product.category)}`}
                className="text-xs font-bold text-[#7A2E2E] hover:text-[#5F2222] uppercase tracking-wider"
              >
                View Category &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  onViewDetails={setModalProduct}
                  whatsappNumber={sc.whatsapp}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Quick View Modal */}
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
