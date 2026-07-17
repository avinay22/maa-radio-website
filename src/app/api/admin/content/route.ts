import { NextRequest, NextResponse } from "next/server";
import { SiteContent } from "@/data/siteContent";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/content
// Returns the current site content (from file or defaults).
// Public — no auth required (content is already displayed publicly).
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase.from('site_content').select('data').limit(1).single();
    if (error || !data) return NextResponse.json({}, { status: 404 });
    return NextResponse.json(data.data, { status: 200 });
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

    const body = await request.json() as Partial<SiteContent>;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    // Use Service Role Key to bypass RLS securely on the server
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: existing } = await supabase.from('site_content').select('id').limit(1).single();
    
    let res;
    if (existing) {
      res = await supabase.from('site_content').update({ data: body, updated_at: new Date().toISOString() }).eq('id', existing.id);
    } else {
      res = await supabase.from('site_content').insert({ data: body });
    }

    if (res.error) throw new Error(res.error.message);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[/api/admin/content POST]", err);
    return NextResponse.json(
      { error: "Failed to save site content." },
      { status: 500 }
    );
  }
}
