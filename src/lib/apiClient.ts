import { SiteContent, DEFAULT_SITE_CONTENT } from "@/data/siteContent";
import { Product, INITIAL_PRODUCTS } from "@/data/products";
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
// The token (issued by /api/admin/auth) authorises the request.

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
// Public read

export async function fetchProducts(): Promise<Product[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data || data.length === 0) return INITIAL_PRODUCTS;

    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      brand: d.brand,
      category: d.category as any,
      price: d.price || undefined,
      image: d.image || "",
      description: d.description || "",
      featured: d.featured || false,
      isAccessoryPageOnly: d.is_accessory_page_only || false,
      specifications: d.specifications || [],
    }));
  } catch {
    return INITIAL_PRODUCTS;
  }
}

// Admin write: goes through the server API route which uses the Service Role Key.

export async function saveProductsApi(
  products: Product[],
  token: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(products),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "Save failed." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
