import { SiteContent, DEFAULT_SITE_CONTENT } from "@/data/siteContent";
import { Product } from "@/data/products";
import { createClient } from "@/lib/supabase/client";

// ── Site Content ─────────────────────────────────────────────────────────────
// Public read: uses the anon Supabase client (respects RLS read policy)

export async function fetchSiteContent(): Promise<SiteContent> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("data")
      .limit(1)
      .single();
    if (error || !data) return DEFAULT_SITE_CONTENT;
    return { ...DEFAULT_SITE_CONTENT, ...(data.data as Partial<SiteContent>) };
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

// Admin write: goes through the server API route which uses the Service Role Key.
// The token is a Supabase Auth JWT (from supabase.auth.signInWithPassword on the client).

export async function saveSiteContentApi(
  content: SiteContent,
  token: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(content),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "Save failed." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

// ── Products ─────────────────────────────────────────────────────────────────
// Supabase is the ONLY source of truth via /api/admin/products.
// Public read: calls /api/admin/products (no fallback to local data)

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch("/api/admin/products", {
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[fetchProducts] API returned status", res.status);
      return [];
    }
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((d: any) => ({
      id: String(d.id),
      name: d.name || "",
      brand: d.brand || "",
      category: d.category || "",
      description: d.description || "",
      images: Array.isArray(d.images) && d.images.length > 0
        ? d.images
        : (d.image ? [d.image] : []),
      specifications: Array.isArray(d.specifications)
        ? d.specifications
        : (typeof d.specifications === "string" && d.specifications
            ? d.specifications.split(",").map((s: string) => s.trim()).filter(Boolean)
            : []),
      originalPrice: d.originalPrice || d.original_price || (d.price ? String(d.price) : ""),
      discountPrice: d.discountPrice || d.discount_price || undefined,
      discountPercentage: d.discountPercentage || d.discount_percentage || undefined,
      featured: Boolean(d.featured),
      newArrival: Boolean(d.newArrival ?? d.new_arrival),
      bestSeller: Boolean(d.bestSeller ?? d.best_seller),
      stockStatus: d.stockStatus || d.stock_status || "In Stock",
      warranty: d.warranty || undefined,
      emiAvailable: Boolean(d.emiAvailable ?? d.emi_available),
      freeGift: d.freeGift || d.free_gift || undefined,
      comboOffer: d.comboOffer || d.combo_offer || undefined,
      cashbackOffer: d.cashbackOffer || d.cashback_offer || undefined,
      offersAndPromotions: d.offersAndPromotions || d.offers_and_promotions || undefined,
      isAccessoryPageOnly: Boolean(d.isAccessoryPageOnly ?? d.is_accessory_page_only),
    }));
  } catch (err) {
    console.error("[fetchProducts] Error fetching products:", err);
    return [];
  }
}

// Admin write: goes through the server API route which uses the Service Role Key.
// Sends a SINGLE product object (not array).

export async function saveProductApi(
  product: Partial<Product> & { id?: string; name: string },
  token: string
): Promise<{ ok: boolean; error?: string; product?: any }> {
  try {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "Save failed." };
    return { ok: true, product: data.product };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Network error. Please try again." };
  }
}

export async function deleteProductApi(
  id: string,
  token: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "Delete failed." };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Network error. Please try again." };
  }
}

export async function bulkDiscountApi(
  payload: { percentage?: number; remove?: boolean },
  token: string
): Promise<{ ok: boolean; error?: string; count?: number }> {
  try {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "bulk_discount", ...payload }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "Bulk discount failed." };
    return { ok: true, count: data.count };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Network error. Please try again." };
  }
}

