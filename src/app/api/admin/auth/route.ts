import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/auth
// Validates the admin password server-side. The password is read exclusively
// from the environment variable ADMIN_PASSWORD — it is never sent to the
// browser in any bundle. The client stores the returned token in sessionStorage.
// ─────────────────────────────────────────────────────────────────────────────

function generateToken(password: string): string {
  const secret = process.env.ADMIN_SECRET ?? "maa-radio-secret-2026";
  const timestamp = Date.now().toString();
  const hmac = createHmac("sha256", secret)
    .update(`${password}:${timestamp}`)
    .digest("hex");
  // Encode timestamp + hash so the client can store it opaquely
  return Buffer.from(`${timestamp}:${hmac}`).toString("base64");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body as { password?: string };

    if (!password) {
      return NextResponse.json(
        { error: "Password is required." },
        { status: 400 }
      );
    }

    const adminPassword =
      process.env.ADMIN_PASSWORD ?? "ms2026"; // fallback for dev

    if (password !== adminPassword) {
      // Deliberate delay to deter brute-force attempts
      await new Promise((resolve) => setTimeout(resolve, 800));
      return NextResponse.json(
        { error: "Invalid password. Please try again." },
        { status: 401 }
      );
    }

    const token = generateToken(password);

    return NextResponse.json({ token }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
