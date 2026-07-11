import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/data/products";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/products
// Returns the current products list (from file or defaults).
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
      category: d.category as any,
      price: d.price || undefined,
      image: d.image || "",
      description: d.description || "",
      featured: d.featured || false,
      isAccessoryPageOnly: d.is_accessory_page_only || false,
      specifications: d.specifications || []
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
// Writes a new products list to the server-side JSON file.
// Requires a valid admin session token in the Authorization header.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
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
      await supabase.from('products').delete().not('id', 'in', `(${currentIds.join(',')})`);
    } else {
      await supabase.from('products').delete().neq('id', 'dummy'); 
    }
    
    if (body.length > 0) {
      const toUpsert = body.map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: p.price,
        image: p.image,
        description: p.description,
        featured: p.featured || false,
        is_accessory_page_only: p.isAccessoryPageOnly || false,
        specifications: p.specifications
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
