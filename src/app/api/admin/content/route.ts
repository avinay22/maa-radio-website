import { NextRequest, NextResponse } from "next/server";
import { readSiteContent, writeSiteContent } from "@/lib/contentStore";
import { SiteContent } from "@/data/siteContent";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/content
// Returns the current site content (from file or defaults).
// Public — no auth required (content is already displayed publicly).
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const content = readSiteContent();
    return NextResponse.json(content, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to read site content." },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/content
// Writes new site content to the server-side JSON file.
// Requires a valid admin session token in the Authorization header.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // Validate the session token — must be present (issued by /api/admin/auth)
    const authHeader = request.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const body = await request.json() as Partial<SiteContent>;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    writeSiteContent(body as SiteContent);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[/api/admin/content POST]", err);
    return NextResponse.json(
      { error: "Failed to save site content." },
      { status: 500 }
    );
  }
}
