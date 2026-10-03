import { NextRequest, NextResponse } from "next/server";
import { processSpinPlay } from "@/lib/spinServer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = body?.code;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { ok: false, error: "Spin code is required." },
        { status: 400 }
      );
    }

    const result = await processSpinPlay(code);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error || "Unable to spin." },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[POST /api/spin/play error]", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to process spin." },
      { status: 500 }
    );
  }
}
