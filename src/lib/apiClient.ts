// ─────────────────────────────────────────────────────────────────────────────
// apiClient.ts — CLIENT-SIDE
// Thin wrappers around the /api/admin/* endpoints.
// All pages (public + admin) use these so there is one source of truth:
// the server-side JSON file. Editing the code defaults in siteContent.ts /
// products.ts works because the API falls back to those defaults when no
// saved file exists yet.
// ─────────────────────────────────────────────────────────────────────────────

import { SiteContent, DEFAULT_SITE_CONTENT } from "@/data/siteContent";
import { Product, INITIAL_PRODUCTS } from "@/data/products";

// ── Site Content ─────────────────────────────────────────────────────────────

export async function fetchSiteContent(): Promise<SiteContent> {
  try {
    const res = await fetch("/api/admin/content", { cache: "no-store" });
    if (!res.ok) throw new Error("Bad response");
    return (await res.json()) as SiteContent;
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

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
    if (!res.ok) return { ok: false, error: data.error };
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

// ── Products ─────────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch("/api/admin/products", { cache: "no-store" });
    if (!res.ok) throw new Error("Bad response");
    return (await res.json()) as Product[];
  } catch {
    return INITIAL_PRODUCTS;
  }
}

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
    if (!res.ok) return { ok: false, error: data.error };
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
