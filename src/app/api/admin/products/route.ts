import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/data/products";
import { createClient } from "@supabase/supabase-js";

function cleanProductId(id?: string | number): string | number {
  if (!id) return Date.now();
  if (typeof id === "number") return id;
  const digitsOnly = String(id).replace(/\D/g, "");
  if (digitsOnly.length > 0 && digitsOnly.length <= 15) {
    return parseInt(digitsOnly, 10);
  }
  return id;
}

function mapProductToRow(p: any) {
  return {
    id: p.id || crypto.randomUUID(),
    name: p.name,
    brand: p.brand || "",
    category: p.category || "",
    description: p.description || "",
    images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
    specifications: Array.isArray(p.specifications) ? p.specifications : [],
    original_price: p.originalPrice || p.original_price || "",
    discount_price: p.discountPrice || p.discount_price || null,
    discount_percentage: p.discountPercentage || p.discount_percentage || null,
    featured: Boolean(p.featured),
    new_arrival: Boolean(p.newArrival || p.new_arrival),
    best_seller: Boolean(p.bestSeller || p.best_seller),
    stock_status: p.stockStatus || p.stock_status || "In Stock",
    warranty: p.warranty || null,
    emi_available: Boolean(p.emiAvailable || p.emi_available),
    free_gift: p.freeGift || p.free_gift || null,
    combo_offer: p.comboOffer || p.combo_offer || null,
    cashback_offer: p.cashbackOffer || p.cashback_offer || null,
    offers_and_promotions: p.offersAndPromotions || p.offers_and_promotions || null,
    is_accessory_page_only: Boolean(p.isAccessoryPageOnly || p.is_accessory_page_only),
    updated_at: new Date().toISOString(),
  };
}

async function upsertWithFallback(supabaseClient: any, data: any) {
  let currentData = { ...data };

  for (let attempt = 0; attempt < 25; attempt++) {
    const { error } = await supabaseClient.from("products").upsert(currentData);
    if (!error) return currentData;

    // Handle bigint input syntax error or out of range: convert ID to numeric
    if (
      error.message?.includes("invalid input syntax for type bigint") ||
      error.message?.includes("out of range for type bigint")
    ) {
      const digits = String(currentData.id || "").replace(/\D/g, "");
      currentData.id = digits && digits.length <= 15 ? parseInt(digits, 10) : Date.now();
      continue;
    }

    // Handle auto-generated identity column error
    if (
      error.message?.includes("identity column") ||
      error.message?.includes("generated always")
    ) {
      delete currentData.id;
      continue;
    }

    // Detect if column doesn't exist in user's Supabase schema
    const match = error.message?.match(
      /Could not find the '([^']+)' column of 'products' in the schema cache/i
    );

    if (match && match[1]) {
      const missingCol = match[1];
      if (missingCol === "original_price" && currentData.original_price && !currentData.price) {
        currentData.price = currentData.original_price;
      }
      if (missingCol === "images" && Array.isArray(currentData.images) && !currentData.image) {
        currentData.image = currentData.images[0] || "";
      }
      delete currentData[missingCol];
      continue;
    }

    throw new Error(error.message);
  }
}

// ─────────────────────────────────────────
// GET /api/admin/products
// Fetch all products directly from Supabase
// ─────────────────────────────────────────
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error && error.message?.includes("created_at")) {
      const fallback = await supabase.from("products").select("*");
      data = fallback.data;
      error = fallback.error;
    }

    if (error) throw new Error(error.message);

    const products: Product[] = (data || []).map((d: any) => ({
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
      originalPrice: d.original_price || (d.price ? String(d.price) : ""),
      discountPrice: d.discount_price || undefined,
      discountPercentage: d.discount_percentage || undefined,
      featured: Boolean(d.featured),
      newArrival: Boolean(d.new_arrival),
      bestSeller: Boolean(d.best_seller),
      stockStatus: d.stock_status || "In Stock",
      warranty: d.warranty || undefined,
      emiAvailable: Boolean(d.emi_available),
      freeGift: d.free_gift || undefined,
      comboOffer: d.combo_offer || undefined,
      cashbackOffer: d.cashback_offer || undefined,
      offersAndPromotions: d.offers_and_promotions || undefined,
      isAccessoryPageOnly: Boolean(d.is_accessory_page_only),
    }));

    return NextResponse.json(products, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: any) {
    console.error("[GET PRODUCTS ERROR]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────
// POST /api/admin/products
// Upsert single product directly to Supabase
// ─────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // 🔐 AUTH CHECK
    const authHeader = request.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } =
      await supabaseAnon.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const productPayload = Array.isArray(body) ? body[0] : body;

    if (!productPayload || typeof productPayload !== "object") {
      return NextResponse.json(
        { error: "Expected a single product object" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const row = mapProductToRow(productPayload);
    const savedRow = await upsertWithFallback(supabase, row);

    return NextResponse.json({ ok: true, product: savedRow }, { status: 200 });
  } catch (err: any) {
    console.error("[POST PRODUCTS ERROR]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to save product" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────
// DELETE /api/admin/products
// Delete product directly from Supabase by ID
// ─────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    // 🔐 AUTH CHECK
    const authHeader = request.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } =
      await supabaseAnon.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");
    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {
        // body may not be JSON
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const cleanId = cleanProductId(id);
    let { error } = await supabase.from("products").delete().eq("id", cleanId);
    if (error && error.message?.includes("invalid input syntax for type bigint")) {
      const res = await supabase.from("products").delete().eq("id", id);
      error = res.error;
    }
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("[DELETE PRODUCT ERROR]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}