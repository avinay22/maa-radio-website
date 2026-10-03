import { NextResponse } from "next/server";
import { getSpinPublicStatus } from "@/lib/spinServer";

export async function GET() {
  try {
    const status = await getSpinPublicStatus();
    return NextResponse.json(status, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("[GET /api/spin/status error]", error);
    return NextResponse.json(
      { isActive: false, rewards: [], totalSpins: 0, error: error?.message },
      { status: 500 }
    );
  }
}
