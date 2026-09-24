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
  const imgList = Array.isArray(p.images) && p.images.length > 0
    ? p.images.map((s: any) => String(s).trim()).filter(Boolean)
    : (p.image ? [String(p.image).trim()] : []);
  const mainImg = imgList[0] || (p.image ? String(p.image).trim() : "");

  return {
    id: p.id || crypto.randomUUID(),
    name: p.name,
    brand: p.brand || "",
    category: p.category || "",
    description: p.description || "",
    image: mainImg,
    images: imgList,
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
      if (missingCol === "discount_price" && currentData.discount_price && !currentData.price) {
        currentData.price = currentData.discount_price;
      }
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
// Helpers for Product Extras (discounts, badges, offers)
// Stored in site_content JSONB for 100% schema resilience
// ─────────────────────────────────────────
async function getProductExtras(supabase: any) {
  try {
    const { data } = await supabase.from("site_content").select("id, data").limit(1).single();
    if (data && data.data && typeof data.data === "object") {
      return { id: data.id, data: data.data, extras: (data.data.productExtras || {}) as Record<string, any> };
    }
  } catch (e) {
    console.error("[getProductExtras error]", e);
  }
  return { id: null, data: null, extras: {} as Record<string, any> };
}

async function saveProductExtra(supabase: any, productId: string | number, extraData: any) {
  try {
    const { id, data, extras } = await getProductExtras(supabase);
    if (!id || !data) return;

    const newExtras = {
      ...extras,
      [String(productId)]: {
        ...(extras[String(productId)] || {}),
        ...extraData,
      },
    };

    await supabase
      .from("site_content")
      .update({
        data: { ...data, productExtras: newExtras },
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
  } catch (e) {
    console.error("[saveProductExtra error]", e);
  }
}

async function removeProductExtra(supabase: any, productId: string | number) {
  try {
    const { id, data, extras } = await getProductExtras(supabase);
    if (!id || !data) return;

    const newExtras = { ...extras };
    delete newExtras[String(productId)];

    await supabase
      .from("site_content")
      .update({
        data: { ...data, productExtras: newExtras },
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
  } catch (e) {
    console.error("[removeProductExtra error]", e);
  }
}

// ─────────────────────────────────────────
// GET /api/admin/products
// Fetch all products directly from Supabase + extras
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

    // Fetch extras from site_content
    const { extras: productExtras } = await getProductExtras(supabase);

    const products: Product[] = (data || []).map((d: any) => {
      const extra = productExtras[String(d.id)] || {};
      return {
        id: String(d.id),
        name: d.name || "",
        brand: d.brand || "",
        category: d.category || "",
        description: d.description || "",
        images: Array.isArray(d.images) && d.images.length > 0
          ? d.images
          : (Array.isArray(extra.images) && extra.images.length > 0
              ? extra.images
              : (d.image ? [d.image] : [])),
        specifications: Array.isArray(d.specifications)
          ? d.specifications
          : (typeof d.specifications === "string" && d.specifications
              ? d.specifications.split(",").map((s: string) => s.trim()).filter(Boolean)
              : []),
        originalPrice: d.original_price || extra.originalPrice || (d.price ? String(d.price) : ""),
        discountPrice: d.discount_price || extra.discountPrice || undefined,
        discountPercentage: d.discount_percentage || extra.discountPercentage || undefined,
        featured: Boolean(d.featured ?? extra.featured),
        newArrival: Boolean(d.new_arrival ?? extra.newArrival),
        bestSeller: Boolean(d.best_seller ?? extra.bestSeller),
        stockStatus: d.stock_status || extra.stockStatus || "In Stock",
        warranty: d.warranty || extra.warranty || undefined,
        emiAvailable: Boolean(d.emi_available ?? extra.emiAvailable),
        freeGift: d.free_gift || extra.freeGift || undefined,
        comboOffer: d.combo_offer || extra.comboOffer || undefined,
        cashbackOffer: d.cashback_offer || extra.cashbackOffer || undefined,
        offersAndPromotions: d.offers_and_promotions || extra.offersAndPromotions || undefined,
        isAccessoryPageOnly: Boolean(d.is_accessory_page_only ?? extra.isAccessoryPageOnly),
      };
    });

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
// Upsert single product or bulk operations
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
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const productPayload = Array.isArray(body) ? body[0] : body;

    if (!productPayload || typeof productPayload !== "object") {
      return NextResponse.json(
        { error: "Expected a single product object" },
        { status: 400 }
      );
    }

    const row = mapProductToRow(productPayload);
    const savedRow = await upsertWithFallback(supabase, row);

    // Persist full extras to site_content
    const targetId = savedRow.id || productPayload.id;
    if (targetId) {
      await saveProductExtra(supabase, targetId, {
        originalPrice: productPayload.originalPrice,
        discountPrice: productPayload.discountPrice || undefined,
        discountPercentage: productPayload.discountPercentage || undefined,
        warranty: productPayload.warranty || undefined,
        emiAvailable: Boolean(productPayload.emiAvailable),
        freeGift: productPayload.freeGift || undefined,
        comboOffer: productPayload.comboOffer || undefined,
        cashbackOffer: productPayload.cashbackOffer || undefined,
        offersAndPromotions: productPayload.offersAndPromotions || undefined,
        newArrival: Boolean(productPayload.newArrival),
        bestSeller: Boolean(productPayload.bestSeller),
        stockStatus: productPayload.stockStatus || "In Stock",
        images: row.images,
      });
    }

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

    // Also remove from extras
    await removeProductExtra(supabase, id);
    if (String(cleanId) !== String(id)) {
      await removeProductExtra(supabase, cleanId);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("[DELETE PRODUCT ERROR]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}