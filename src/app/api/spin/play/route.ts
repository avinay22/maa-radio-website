import { NextRequest, NextResponse } from "next/server";
import { processSpinPlay, processDirectSpinPlay } from "@/lib/spinServer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";

    let result;
    if (code) {
      // Customer used scratch card code
      result = await processSpinPlay(code);
    } else {
      // Direct Spin: 1-Click Spin governed by Admin's Target Next Prize & Sequence
      result = await processDirectSpinPlay({ name, phone });
    }

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
