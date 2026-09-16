import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/data/products";
import { createClient } from "@supabase/supabase-js";

function mapProductToRow(p: Product) {
  return {
    id: p.id || crypto.randomUUID(),
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

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const products: Product[] = (data || []).map((d: any) => ({
      id: d.id,
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
      const { error } = await supabase.from("products").upsert(rows);
      if (error) throw new Error(error.message);
    } else {
      const row = mapProductToRow(body);
      const { error } = await supabase.from("products").upsert(row);
      if (error) throw new Error(error.message);
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

    const { error } = await supabase.from("products").delete().eq("id", id);
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