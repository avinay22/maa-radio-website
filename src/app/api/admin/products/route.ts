import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/data/products";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────
// GET /api/admin/products
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

    const products = (data || []).map((d: any) => ({
      id: d.id,
      name: d.name,
      brand: d.brand,
      category: d.category,
      description: d.description || "",
      images: d.images || [],
      specifications: d.specifications || [],
      originalPrice: d.original_price || "",
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
  } catch (err) {
    console.error("[GET PRODUCTS ERROR]", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────
// POST /api/admin/products
// SAVE SINGLE PRODUCT (FIXED)
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

    // ✅ RECEIVE SINGLE PRODUCT
    const body = await request.json() as Product;

    // ❌ REMOVE ARRAY CHECK (IMPORTANT)
    // no Array.isArray
    // no map
    // no length

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ✅ SAVE PRODUCT
    const { error } = await supabase.from("products").upsert({
      id: body.id || crypto.randomUUID(),  // 🔥 CRITICAL FIX
      name: body.name,
      brand: body.brand,
      category: body.category,
      description: body.description,
      images: body.images || [],
      specifications: body.specifications || [],
      original_price: body.originalPrice || "",
      discount_price: body.discountPrice || null,
      discount_percentage: body.discountPercentage || null,
      featured: body.featured || false,
      new_arrival: body.newArrival || false,
      best_seller: body.bestSeller || false,
      stock_status: body.stockStatus || "In Stock",
      warranty: body.warranty || null,
      emi_available: body.emiAvailable || false,
      free_gift: body.freeGift || null,
      combo_offer: body.comboOffer || null,
      cashback_offer: body.cashbackOffer || null,
      offers_and_promotions: body.offersAndPromotions || null,
      is_accessory_page_only: body.isAccessoryPageOnly || false,
    });

    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true }, { status: 200 });

  } catch (err) {
    console.error("[POST PRODUCTS ERROR]", err);
    return NextResponse.json(
      { error: "Failed to save product" },
      { status: 500 }
    );
  }
}