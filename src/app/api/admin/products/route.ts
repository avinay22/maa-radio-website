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

function mapProductToRow(p: Product) {
  return {
    id: cleanProductId(p.id),
    name: p.name,
    brand: p.brand,
    category: p.category,
    description: p.description || "",
    images: p.images || [],
    specifications: p.specifications || [],
    original_price: p.originalPrice || "",
    discount_price: p.discountPrice || null,
    discount_percentage: p.discountPercentage || null,
    featured: p.featured || false,
    new_arrival: p.newArrival || false,
    best_seller: p.bestSeller || false,
    stock_status: p.stockStatus || "In Stock",
    warranty: p.warranty || null,
    emi_available: p.emiAvailable || false,
    free_gift: p.freeGift || null,
    combo_offer: p.comboOffer || null,
    cashback_offer: p.cashbackOffer || null,
    offers_and_promotions: p.offersAndPromotions || null,
    is_accessory_page_only: p.isAccessoryPageOnly || false,
    updated_at: new Date().toISOString(),
  };
}

async function upsertWithFallback(supabaseClient: any, data: any) {
  let currentData = Array.isArray(data)
    ? data.map((r: any) => ({ ...r }))
    : { ...data };

  for (let attempt = 0; attempt < 25; attempt++) {
    const { error } = await supabaseClient.from("products").upsert(currentData);
    if (!error) return;

    // Handle bigint input syntax error: convert ID to numeric
    if (error.message?.includes("invalid input syntax for type bigint")) {
      if (Array.isArray(currentData)) {
        currentData.forEach((row: any) => {
          const digits = String(row.id || "").replace(/\D/g, "");
          row.id = digits ? parseInt(digits, 10) : Date.now();
        });
      } else {
        const digits = String(currentData.id || "").replace(/\D/g, "");
        currentData.id = digits ? parseInt(digits, 10) : Date.now();
      }
      continue;
    }

    // Handle auto-generated identity column error
    if (
      error.message?.includes("identity column") ||
      error.message?.includes("generated always")
    ) {
      if (Array.isArray(currentData)) {
        currentData.forEach((row: any) => delete row.id);
      } else {
        delete currentData.id;
      }
      continue;
    }

    // Detect if column doesn't exist in user's Supabase schema
    const match = error.message?.match(
      /Could not find the '([^']+)' column of 'products' in the schema cache/i
    );

    if (match && match[1]) {
      const missingCol = match[1];
      if (Array.isArray(currentData)) {
        currentData.forEach((row: any) => {
          if (missingCol === "original_price" && row.original_price && !row.price) {
            row.price = row.original_price;
          }
          if (missingCol === "images" && Array.isArray(row.images) && !row.image) {
            row.image = row.images[0] || "";
          }
          delete row[missingCol];
        });
      } else {
        if (missingCol === "original_price" && currentData.original_price && !currentData.price) {
          currentData.price = currentData.original_price;
        }
        if (missingCol === "images" && Array.isArray(currentData.images) && !currentData.image) {
          currentData.image = currentData.images[0] || "";
        }
        delete currentData[missingCol];
      }
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
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
      name: d.name,
      brand: d.brand,
      category: d.category,
      description: d.description || "",
      images: d.images || (d.image ? [d.image] : []),
      specifications: d.specifications || [],
      originalPrice: d.original_price || d.price || "",
      discountPrice: d.discount_price || undefined,
      discountPercentage: d.discount_percentage || undefined,
      featured: d.featured || false,
      newArrival: d.new_arrival || false,
      bestSeller: d.best_seller || false,
      stockStatus: d.stock_status || "In Stock",
      warranty: d.warranty || undefined,
      emiAvailable: d.emi_available || false,
      freeGift: d.free_gift || undefined,
      comboOffer: d.combo_offer || undefined,
      cashbackOffer: d.cashback_offer || undefined,
      offersAndPromotions: d.offers_and_promotions || undefined,
      isAccessoryPageOnly: d.is_accessory_page_only || false,
    }));

    return NextResponse.json(products, { status: 200 });
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
// Upsert product(s) directly to Supabase
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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (Array.isArray(body)) {
      const rows = body.map(mapProductToRow);
      await upsertWithFallback(supabase, rows);
    } else {
      const row = mapProductToRow(body);
      await upsertWithFallback(supabase, row);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
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
      process.env.SUPABASE_SERVICE_ROLE_KEY!
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