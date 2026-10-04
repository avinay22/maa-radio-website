"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, RefreshCw, Package } from "lucide-react";
import { Product } from "@/data/products";
import { SiteContent, DEFAULT_SITE_CONTENT, STATIC_CONTENT } from "@/data/siteContent";
import { fetchProducts, fetchSiteContent } from "@/lib/apiClient";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";

function ProductsCatalog() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [products, setProducts] = useState<Product[]>([]);
  const [sc, setSc] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

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
    <div className="min-h-screen bg-slate-50/50 pt-28 pb-20 relative">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-64 bg-sky-200/20 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Page Header */}
        <div className="border-b border-slate-200/80 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-bold tracking-wider uppercase mb-3">
              <span>Verified Store Inventory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Smartphones &amp; Gadgets
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-xs">
              Showing <strong className="text-slate-900 font-bold">{filteredProducts.length}</strong> products
            </span>
            <p className="text-slate-500 text-xs sm:text-sm max-w-xs leading-relaxed">
              Official warranty with instant WhatsApp purchase support from {STATIC_CONTENT.ownerName}.
            </p>
          </div>
        </div>

        {/* Layout Grid: Filters Left, Grid Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* Filters Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Search Products</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search name, brand, spec..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                  />
                  <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Categories</h3>
                <div className="flex flex-col gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-left text-xs font-medium py-2 px-3 rounded-xl transition-all flex items-center justify-between ${
                        selectedCategory === cat
                          ? "bg-slate-950 text-white font-semibold shadow-xs"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <span>{cat}</span>
                      {selectedCategory === cat && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Brand Filter</h3>
                <div className="flex flex-wrap gap-1.5">
                  {brands.map((b) => (
                    <button
                      key={b}
                      onClick={() => setSelectedBrand(b)}
                      className={`text-xs py-1.5 px-3 rounded-full border transition-all ${
                        selectedBrand === b
                          ? "bg-sky-500 text-white border-sky-500 font-semibold shadow-xs"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 bg-white"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {(searchTerm || selectedCategory !== "All" || selectedBrand !== "All") && (
                <button
                  onClick={handleResetFilters}
                  className="w-full py-2.5 border border-slate-200 text-xs font-semibold rounded-2xl text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={13} />
                  Reset Filters
                </button>
              )}
            </div>
          </aside>

          {/* Mobile Search + Filter Toggle */}
          <div className="lg:hidden flex gap-3 w-full mb-4 col-span-full">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search phones, accessories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 shadow-xs"
              />
              <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
            </div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="px-5 py-3 bg-slate-950 text-white rounded-2xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider shadow-sm active:scale-95 transition-all"
            >
              <SlidersHorizontal size={16} />
              Filter
            </button>
          </div>

          {/* Mobile Filters Drawer */}
          {showMobileFilters && (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex justify-end lg:hidden">
              <div className="w-80 bg-white h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Filter Catalogue</h3>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-900 uppercase"
                    >
                      Close
                    </button>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`text-xs py-1.5 px-3 rounded-xl border transition-all ${
                            selectedCategory === cat
                              ? "bg-slate-950 text-white border-slate-950 font-semibold"
                              : "border-slate-200 text-slate-700 bg-white"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Brands</h4>
                    <div className="flex flex-wrap gap-2">
                      {brands.map((b) => (
                        <button
                          key={b}
                          onClick={() => setSelectedBrand(b)}
                          className={`text-xs py-1.5 px-3 rounded-full border transition-all ${
                            selectedBrand === b
                              ? "bg-sky-500 text-white border-sky-500 font-semibold"
                              : "border-slate-200 text-slate-700 bg-white"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-8 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => { handleResetFilters(); setShowMobileFilters(false); }}
                    className="w-full py-3 border border-slate-200 rounded-2xl text-xs font-bold uppercase tracking-wider text-slate-700 text-center"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full py-3 bg-slate-950 text-white rounded-2xl text-xs font-bold uppercase tracking-wider text-center shadow-md"
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
              <div className="text-center py-20 bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs">
                <Package size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-base font-bold text-slate-900 mb-1">No products found</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                  {products.length === 0
                    ? "Our catalogue is currently updating. Tap WhatsApp to check direct availability with the store."
                    : "No items match your active filters. Try searching for a different brand or clearing filters."}
                </p>
                {products.length > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-slate-800 transition-all shadow-sm"
                  >
                    <RefreshCw size={12} />
                    Reset all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={setModalProduct}
                    whatsappNumber={sc.whatsapp}
                  />
                ))}
              </div>
            )}
          </main>

        </div>
      </div>

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
