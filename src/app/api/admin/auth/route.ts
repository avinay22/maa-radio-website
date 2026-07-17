import { NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/auth
// DEPRECATED — Admin authentication is now handled directly via Supabase Auth
// (supabase.auth.signInWithPassword) on the client side.
//
// This route is kept as a stub to avoid 404 errors from any cached references.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST() {
  return NextResponse.json(
    {
      error:
        "This auth endpoint is deprecated. Please use Supabase Auth directly via the admin login form.",
    },
    { status: 410 }
  );
}
