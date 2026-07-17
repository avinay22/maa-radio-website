import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/data/products";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/products
// Returns the current products list.
// Public — no auth required.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error || !data) return NextResponse.json([], { status: 404 });

    const products = data.map((d: any) => ({
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
  } catch {
    return NextResponse.json(
      { error: "Failed to read products." },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/products
// Writes a new products list to Supabase.
// Requires a valid admin session token in the Authorization header.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // Validate the session token — must be present and valid in Supabase Auth
    const authHeader = request.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Session is invalid or expired." },
        { status: 401 }
      );
    }

    const body = await request.json() as Product[];
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid payload. Expected an array." }, { status: 400 });
    }

    // Use Service Role Key to bypass RLS securely on the server
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const currentIds = body.map(p => p.id);
    if (currentIds.length > 0) {
      // In Supabase, if ID has special chars or commas we format it carefully.
      // We delete any products no longer present.
      const { error: delError } = await supabase.from('products').delete().not('id', 'in', `(${currentIds.map(id => `"${id}"`).join(',')})`);
      if (delError) console.error("Error deleting old products:", delError);
    } else {
      await supabase.from('products').delete().neq('id', 'dummy'); 
    }
    
    if (body.length > 0) {
      const toUpsert = body.map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        description: p.description,
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
      }));
  
      const res = await supabase.from('products').upsert(toUpsert);
      if (res.error) throw new Error(res.error.message);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[/api/admin/products POST]", err);
    return NextResponse.json(
      { error: "Failed to save products." },
      { status: 500 }
    );
  }
}

