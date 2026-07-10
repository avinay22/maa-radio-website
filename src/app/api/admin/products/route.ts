import { NextRequest, NextResponse } from "next/server";
import { readProducts, writeProducts } from "@/lib/productsStore";
import { Product } from "@/data/products";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/products
// Returns the current products list (from file or defaults).
// Public — no auth required.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const products = readProducts();
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

    writeProducts(body);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[/api/admin/products POST]", err);
    return NextResponse.json(
      { error: "Failed to save products." },
      { status: 500 }
    );
  }
}
