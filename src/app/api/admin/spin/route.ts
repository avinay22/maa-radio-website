import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseBackend } from "@/lib/spinServer";

async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) return null;

  try {
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error } = await supabaseAnon.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/spin
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const user = await verifyAdminAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseBackend();

    const [settingsRes, rewardsRes, statsRes, codesRes] = await Promise.all([
      supabase.from("spin_settings").select("*").eq("id", "global").maybeSingle(),
      supabase.from("spin_rewards").select("*").order("created_at", { ascending: true }),
      supabase.from("spin_stats").select("*").eq("id", "global").maybeSingle(),
      supabase.from("spin_codes").select("*").order("card_number", { ascending: true }).limit(200),
    ]);

    let codes = [];
    if (!codesRes.error && codesRes.data && codesRes.data.length > 0) {
      codes = codesRes.data;
    } else {
      // Fallback to preassigned list
      const { PREASSIGNED_SPIN_CODES } = await import("@/data/spinCodesData");
      codes = PREASSIGNED_SPIN_CODES.map((item) => ({
        id: `card-${item.card}`,
        card_number: item.card,
        code: item.code,
        prize: item.prize,
        used: false,
        used_at: null,
      }));
    }

    return NextResponse.json({
      settings: settingsRes.data || { id: "global", is_active: true },
      rewards: rewardsRes.data || [],
      stats: statsRes.data || { id: "global", total_spins: 0 },
      codes,
    });
  } catch (error: any) {
    console.error("[GET /api/admin/spin error]", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch admin data." }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/spin
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const user = await verifyAdminAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = body?.action;
    const supabase = getSupabaseBackend();

    // 1. Toggle ON / OFF
    if (action === "toggle_active") {
      const isActive = Boolean(body.isActive);
      const { data, error } = await supabase
        .from("spin_settings")
        .upsert({ id: "global", is_active: isActive, updated_at: new Date().toISOString() })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true, settings: data });
    }

    // 2. Save / Update Reward
    if (action === "save_reward") {
      const reward = body.reward;
      if (!reward || !reward.reward_name) {
        return NextResponse.json({ error: "Reward name is required." }, { status: 400 });
      }

      const payload = {
        reward_name: String(reward.reward_name).trim(),
        type: reward.type === "milestone" ? "milestone" : "random",
        milestone: reward.type === "milestone" && reward.milestone ? parseInt(reward.milestone, 10) : null,
        enabled: reward.enabled !== undefined ? Boolean(reward.enabled) : true,
      };

      let query;
      if (reward.id && !reward.id.startsWith("new-")) {
        query = supabase.from("spin_rewards").update(payload).eq("id", reward.id).select().single();
      } else {
        query = supabase.from("spin_rewards").insert(payload).select().single();
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true, reward: data });
    }

    // 3. Delete Reward
    if (action === "delete_reward") {
      const id = body.id;
      if (!id) return NextResponse.json({ error: "Reward ID required." }, { status: 400 });

      const { error } = await supabase.from("spin_rewards").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true });
    }

    // 4. Generate Codes
    if (action === "create_codes") {
      const { customCode, count = 1 } = body;
      const codesToInsert: Array<{ code: string; used: boolean }> = [];

      if (customCode && typeof customCode === "string" && customCode.trim()) {
        codesToInsert.push({
          code: customCode.trim().toUpperCase(),
          used: false,
        });
      } else {
        const num = Math.min(Math.max(parseInt(String(count), 10) || 1, 1), 50);
        for (let i = 0; i < num; i++) {
          const randHex = Math.random().toString(36).substring(2, 7).toUpperCase();
          codesToInsert.push({
            code: `SPIN-${randHex}`,
            used: false,
          });
        }
      }

      const { data, error } = await supabase
        .from("spin_codes")
        .insert(codesToInsert)
        .select();

      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true, codes: data });
    }

    // 5. Delete Code
    if (action === "delete_code") {
      const id = body.id;
      if (!id) return NextResponse.json({ error: "Code ID required." }, { status: 400 });

      const { error } = await supabase.from("spin_codes").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true });
    }

    // 6. Toggle Code Used (e.g. make unclaimed again)
    if (action === "toggle_code_used") {
      const { id, code, used } = body;
      const targetUsed = Boolean(used);

      if (!code && !id) {
        return NextResponse.json({ error: "Code or ID required." }, { status: 400 });
      }

      let query = supabase.from("spin_codes").update({
        used: targetUsed,
        used_at: targetUsed ? new Date().toISOString() : null,
      });

      if (id && !String(id).startsWith("card-")) {
        query = query.eq("id", id);
      } else if (code) {
        query = query.ilike("code", String(code).trim());
      }

      const { error } = await query;
      if (error && !error.message?.includes("does not exist")) {
        throw new Error(error.message);
      }

      const { markCodeUsedInMemory } = await import("@/lib/spinServer");
      if (code) markCodeUsedInMemory(code, targetUsed);

      return NextResponse.json({ ok: true, used: targetUsed });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("[POST /api/admin/spin error]", error);
    return NextResponse.json({ error: error?.message || "Failed to execute spin action." }, { status: 500 });
  }
}
