"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, MessageSquare, SlidersHorizontal, RefreshCw, Package } from "lucide-react";
import { Product } from "@/data/products";
import { SiteContent, DEFAULT_SITE_CONTENT, STATIC_CONTENT } from "@/data/siteContent";
import { fetchProducts, fetchSiteContent } from "@/lib/apiClient";

function ProductsCatalog() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [products, setProducts] = useState<Product[]>([]);
  const [sc, setSc] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync state with query parameter
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Load products and site content
  useEffect(() => {
    fetchProducts().then(setProducts);
    fetchSiteContent().then(setSc);
  }, []);

  // Build category list from admin-defined categories + "All"
  const categories = [
    "All",
    ...sc.categories
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => c.name),
  ];

  const brands = ["All", ...Array.from(new Set(products.map((p) => p.brand).filter(Boolean)))];

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    const matchesBrand =
      selectedBrand === "All" || product.brand === selectedBrand;

    // Accessory-only products are hidden unless Accessories is explicitly selected
    const isAppropriateCatalogItem =
      selectedCategory === "Accessories" ? true : !product.isAccessoryPageOnly;

    return matchesSearch && matchesCategory && matchesBrand && isAppropriateCatalogItem;
  });

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedBrand("All");
  };

  const getWhatsAppLink = (product: Product) => {
    const text = encodeURIComponent(
      `Hi ${STATIC_CONTENT.ownerName}, I am interested in buying the ${product.brand} ${product.name} listed on your website. Is this item currently in stock?`
    );
    return `https://wa.me/${sc.whatsapp || "917002733658"}?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Page Header */}
        <div className="border-b border-[#E2E2DF] pb-10 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#8A6A44] uppercase">
              Digital Showcase
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#222222] mt-2">
              Our Products
            </h1>
          </div>
          <p className="text-[#666666] text-sm max-w-sm">
            Browse our verified catalogue. Tap the WhatsApp button to verify stock, request delivery, or ask questions directly to {STATIC_CONTENT.ownerName}.
          </p>
        </div>

        {/* Layout Grid: Filters Left, Grid Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Filters Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222] mb-4">Search Products</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search name, brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#F8F8F6] border border-[#E2E2DF] px-4 py-3 pl-10 text-sm text-[#222222] focus:outline-none focus:border-[#7A2E2E]"
                />
                <Search className="absolute left-3.5 top-3.5 text-[#666666]" size={16} />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222] mb-4">Categories</h3>
              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-left text-sm py-2 px-3 transition-colors ${
                      selectedCategory === cat
                        ? "bg-[#7A2E2E] text-white font-semibold"
                        : "text-[#666666] hover:bg-[#F8F8F6] hover:text-[#222222]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222] mb-4">Filter by Brand</h3>
              <div className="flex flex-col gap-2">
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className={`text-left text-sm py-2 px-3 transition-colors ${
                      selectedBrand === b
                        ? "bg-[#8A6A44] text-white font-semibold"
                        : "text-[#666666] hover:bg-[#F8F8F6] hover:text-[#222222]"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleResetFilters}
              className="w-full py-3 border border-[#E2E2DF] text-xs font-bold uppercase tracking-wider text-[#222222] hover:bg-[#F8F8F6] transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={13} />
              Clear Filters
            </button>
          </aside>

          {/* Mobile Search + Filter Toggle */}
          <div className="lg:hidden flex gap-4 w-full mb-6 col-span-full">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F8F8F6] border border-[#E2E2DF] px-4 py-3 pl-10 text-sm text-[#222222] focus:outline-none focus:border-[#7A2E2E]"
              />
              <Search className="absolute left-3.5 top-3.5 text-[#666666]" size={16} />
            </div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="px-4 py-3 bg-[#222222] text-white flex items-center gap-2 text-sm focus:outline-none"
            >
              <SlidersHorizontal size={18} />
              Filters
            </button>
          </div>

          {/* Mobile Filters Drawer */}
          {showMobileFilters && (
            <div className="fixed inset-0 bg-black/40 z-50 flex justify-end lg:hidden">
              <div className="w-80 bg-white h-full p-8 overflow-y-auto flex flex-col justify-between">
                <div className="space-y-8">
                  <div className="flex justify-between items-center border-b border-[#E2E2DF] pb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#222222]">Filter Products</h3>
                    <button onClick={() => setShowMobileFilters(false)} className="text-xs font-bold text-[#7A2E2E] uppercase">
                      Close
                    </button>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#666666] mb-3">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`text-xs py-2 px-3 border transition-colors ${
                            selectedCategory === cat
                              ? "bg-[#7A2E2E] text-white border-[#7A2E2E]"
                              : "border-[#E2E2DF] text-[#666666]"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#666666] mb-3">Brands</h4>
                    <div className="flex flex-wrap gap-2">
                      {brands.map((b) => (
                        <button
                          key={b}
                          onClick={() => setSelectedBrand(b)}
                          className={`text-xs py-2 px-3 border transition-colors ${
                            selectedBrand === b
                              ? "bg-[#8A6A44] text-white border-[#8A6A44]"
                              : "border-[#E2E2DF] text-[#666666]"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-12">
                  <button
                    onClick={() => { handleResetFilters(); setShowMobileFilters(false); }}
                    className="w-full py-3 border border-[#E2E2DF] text-xs font-bold uppercase tracking-wider text-[#222222] text-center"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full py-3 bg-[#7A2E2E] text-white text-xs font-bold uppercase tracking-wider text-center"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <main className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-[#F8F8F6] border border-[#E2E2DF]">
                <Package size={40} className="mx-auto text-[#CCCCCC] mb-4" />
                <p className="text-[#666666] text-sm mb-4">
                  {products.length === 0
                    ? "No products in the catalogue yet. Check back soon or contact us directly."
                    : "No products matched your active filters."}
                </p>
                {products.length > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-[#7A2E2E] hover:text-[#5F2222] uppercase tracking-wider underline"
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-[#F8F8F6] border border-[#E2E2DF] flex flex-col justify-between p-6 group hover:shadow-md transition-all duration-300 relative"
                  >
                    {/* Badges row */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {product.newArrival && (
                        <span className="text-[8px] bg-blue-50 border border-blue-200 text-blue-800 px-1.5 py-0.5 font-bold uppercase">New</span>
                      )}
                      {product.bestSeller && (
                        <span className="text-[8px] bg-amber-50 border border-amber-200 text-amber-800 px-1.5 py-0.5 font-bold uppercase">Best Seller</span>
                      )}
                      {product.discountPercentage && (
                        <span className="text-[8px] bg-[#7A2E2E] text-white px-1.5 py-0.5 font-bold uppercase">{product.discountPercentage} OFF</span>
                      )}
                    </div>

                    {/* Top: Brand + Price */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[9px] font-bold text-[#8A6A44] uppercase tracking-wider">
                          {product.brand}
                        </span>
                        <h3 className="text-base font-bold text-[#222222] mt-0.5 group-hover:text-[#7A2E2E] transition-colors">
                          {product.name}
                        </h3>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        {product.discountPrice ? (
                          <>
                            <div className="text-xs font-bold text-[#7A2E2E]">{product.discountPrice}</div>
                            <div className="text-[9px] line-through text-[#AAAAAA]">{product.originalPrice}</div>
                          </>
                        ) : product.originalPrice ? (
                          <div className="text-xs font-semibold text-[#7A2E2E] bg-white px-2 py-1 border border-[#E2E2DF]">{product.originalPrice}</div>
                        ) : null}
                      </div>
                    </div>

                    {/* Image Area */}
                    <div className="aspect-[4/3] flex items-center justify-center bg-white border border-[#E2E2DF] p-6 mb-5 overflow-hidden relative">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="max-h-[140px] w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="text-[#CCCCCC]"><Package size={40} /></div>
                      )}
                      {/* Stock status pill */}
                      <div className={`absolute bottom-2 right-2 text-[8px] font-bold uppercase px-1.5 py-0.5 ${
                        product.stockStatus === "In Stock"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : product.stockStatus === "Limited Stock"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {product.stockStatus}
                      </div>
                    </div>

                    {/* Description & Specs */}
                    <div className="space-y-3 flex-1">
                      <p className="text-xs text-[#666666] leading-relaxed line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {product.specifications.slice(0, 2).map((spec, i) => (
                          <span
                            key={i}
                            className="text-[9px] text-[#666666] bg-white border border-[#E2E2DF] px-2 py-0.5 uppercase tracking-wide"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      {/* Offer hints */}
                      <div className="flex flex-wrap gap-1">
                        {product.emiAvailable && (
                          <span className="text-[8px] bg-teal-50 border border-teal-200 text-teal-800 px-1.5 py-0.5 font-bold uppercase">💳 EMI</span>
                        )}
                        {product.freeGift && (
                          <span className="text-[8px] bg-green-50 border border-green-200 text-green-800 px-1.5 py-0.5 font-bold uppercase">🎁 Gift</span>
                        )}
                        {product.warranty && (
                          <span className="text-[8px] bg-[#F8F8F6] border border-[#E2E2DF] text-[#666666] px-1.5 py-0.5 uppercase">🛡️ Warranty</span>
                        )}
                      </div>
                    </div>

                    {/* WhatsApp Button */}
                    <div className="mt-6 pt-4 border-t border-[#E2E2DF]">
                      <a
                        href={getWhatsAppLink(product)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#7A2E2E] hover:bg-[#5F2222] text-white text-xs font-bold uppercase tracking-wider transition-colors duration-250"
                      >
                        <MessageSquare size={13} />
                        WhatsApp Enquiry
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-semibold tracking-wider text-[#666666] uppercase animate-pulse">
            Loading products catalog...
          </p>
        </div>
      </div>
    }>
      <ProductsCatalog />
    </Suspense>
  );
}
