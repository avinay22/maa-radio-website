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

    const [settingsRes, rewardsRes, statsRes, codesRes, contentRes] = await Promise.all([
      supabase.from("spin_settings").select("*").eq("id", "global").maybeSingle(),
      supabase.from("spin_rewards").select("*").order("created_at", { ascending: true }),
      supabase.from("spin_stats").select("*").eq("id", "global").maybeSingle(),
      supabase.from("spin_codes").select("*").order("card_number", { ascending: true }).limit(200),
      supabase.from("site_content").select("data").limit(1).maybeSingle(),
    ]);

    const { resolveRewardImage, getDefaultSpinControl } = await import("@/lib/spinServer");
    const contentData = contentRes.data?.data || {};
    const storedRewardImages: Record<string, string> =
      (typeof contentData === "object" && (contentData as any).spinRewardImages) || {};
    const spinControl =
      (typeof contentData === "object" && (contentData as any).spinControl) || getDefaultSpinControl();

    const rewards = (rewardsRes.data || []).map((r: any) => ({
      ...r,
      image_url: resolveRewardImage(
        r.reward_name,
        r.image_url || storedRewardImages[r.id] || storedRewardImages[r.reward_name]
      ),
    }));

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
      rewards,
      stats: statsRes.data || { id: "global", total_spins: 0 },
      codes,
      spinControl,
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

    // 2. Save / Update Reward (with Name & Photo / Image editing)
    if (action === "save_reward") {
      const reward = body.reward;
      if (!reward || !reward.reward_name) {
        return NextResponse.json({ error: "Reward name is required." }, { status: 400 });
      }

      const newRewardName = String(reward.reward_name).trim();
      const imageUrl = reward.image_url ? String(reward.image_url).trim() : "";

      const payload: Record<string, any> = {
        reward_name: newRewardName,
        type: reward.type === "milestone" ? "milestone" : "random",
        milestone: reward.type === "milestone" && reward.milestone ? parseInt(reward.milestone, 10) : null,
        enabled: reward.enabled !== undefined ? Boolean(reward.enabled) : true,
      };

      // Check if updating an existing reward
      let oldRewardName: string | null = null;
      let targetId = reward.id;

      if (targetId && !targetId.startsWith("new-")) {
        const { data: existing } = await supabase
          .from("spin_rewards")
          .select("reward_name")
          .eq("id", targetId)
          .maybeSingle();
        if (existing?.reward_name) {
          oldRewardName = existing.reward_name;
        }
      }

      // 1. Try to save to spin_rewards (with image_url if column exists)
      let savedData: any = null;
      try {
        const payloadWithImg = { ...payload, image_url: imageUrl || null };
        let query;
        if (targetId && !targetId.startsWith("new-")) {
          query = supabase.from("spin_rewards").update(payloadWithImg).eq("id", targetId).select().single();
        } else {
          query = supabase.from("spin_rewards").insert(payloadWithImg).select().single();
        }
        const { data, error } = await query;
        if (!error && data) {
          savedData = data;
        } else {
          throw error;
        }
      } catch {
        // Fallback without image_url column if not yet created in table
        let fallbackQuery;
        if (targetId && !targetId.startsWith("new-")) {
          fallbackQuery = supabase.from("spin_rewards").update(payload).eq("id", targetId).select().single();
        } else {
          fallbackQuery = supabase.from("spin_rewards").insert(payload).select().single();
        }
        const { data, error } = await fallbackQuery;
        if (error) throw new Error(error.message);
        savedData = data;
      }

      const rewardId = savedData?.id || targetId || "temp";

      // 2. Also persist photo in site_content.data.spinRewardImages for 100% reliable image loading
      if (imageUrl !== undefined) {
        try {
          const { data: contentRow } = await supabase.from("site_content").select("id, data").limit(1).maybeSingle();
          if (contentRow && contentRow.id) {
            const currentData = contentRow.data || {};
            const spinRewardImages = { ...(currentData.spinRewardImages || {}) };
            spinRewardImages[rewardId] = imageUrl;
            spinRewardImages[newRewardName] = imageUrl;
            if (oldRewardName && oldRewardName !== newRewardName) {
              delete spinRewardImages[oldRewardName];
            }
            const { error: updateErr } = await supabase.from("site_content").update({
              data: { ...currentData, spinRewardImages },
              updated_at: new Date().toISOString(),
            }).eq("id", contentRow.id);

            if (updateErr) {
              console.error("[save_reward] site_content update error:", updateErr);
            }
          }
        } catch (imgErr) {
          console.warn("[save_reward] site_content spinRewardImages sync warning:", imgErr);
        }
      }

      // 3. If reward name changed, keep all spin_codes in sync with the new reward name!
      if (oldRewardName && oldRewardName !== newRewardName) {
        try {
          await supabase
            .from("spin_codes")
            .update({ prize: newRewardName })
            .ilike("prize", oldRewardName);
        } catch (codeSyncErr) {
          console.warn("[save_reward] spin_codes prize rename warning:", codeSyncErr);
        }
      }

      return NextResponse.json({
        ok: true,
        reward: {
          ...savedData,
          image_url: imageUrl || savedData?.image_url,
        },
      });
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

    // 7. Set Target Next Prize (1-click owner selection)
    if (action === "set_next_prize") {
      const nextPrize = body.nextPrize ? String(body.nextPrize).trim() : null;
      const { getDefaultSpinControl } = await import("@/lib/spinServer");
      const { data: contentRow } = await supabase.from("site_content").select("id, data").limit(1).maybeSingle();
      if (!contentRow || !contentRow.id) {
        return NextResponse.json({ error: "site_content table row not found." }, { status: 500 });
      }

      const currentData = contentRow.data || {};
      const spinControl = {
        ...getDefaultSpinControl(),
        ...(currentData.spinControl || {}),
        next_prize: nextPrize,
      };

      const { error: updateErr } = await supabase.from("site_content").update({
        data: { ...currentData, spinControl },
        updated_at: new Date().toISOString(),
      }).eq("id", contentRow.id);

      if (updateErr) throw new Error(updateErr.message);
      return NextResponse.json({ ok: true, spinControl });
    }

    // 8. Update Full Spin Control (e.g. toggle direct spin vs code required, mode, etc.)
    if (action === "update_spin_control") {
      const { getDefaultSpinControl } = await import("@/lib/spinServer");
      const { data: contentRow } = await supabase.from("site_content").select("id, data").limit(1).maybeSingle();
      if (!contentRow || !contentRow.id) {
        return NextResponse.json({ error: "site_content table row not found." }, { status: 500 });
      }

      const currentData = contentRow.data || {};
      const spinControl = {
        ...getDefaultSpinControl(),
        ...(currentData.spinControl || {}),
        ...(body.spinControl || {}),
      };

      const { error: updateErr } = await supabase.from("site_content").update({
        data: { ...currentData, spinControl },
        updated_at: new Date().toISOString(),
      }).eq("id", contentRow.id);

      if (updateErr) throw new Error(updateErr.message);
      return NextResponse.json({ ok: true, spinControl });
    }

    // 9. Update Specific Sequence Step
    if (action === "update_sequence_item") {
      const { index, prize } = body;
      const { getDefaultSpinControl } = await import("@/lib/spinServer");
      const { data: contentRow } = await supabase.from("site_content").select("id, data").limit(1).maybeSingle();
      if (!contentRow || !contentRow.id) {
        return NextResponse.json({ error: "site_content table row not found." }, { status: 500 });
      }

      const currentData = contentRow.data || {};
      const spinControl = {
        ...getDefaultSpinControl(),
        ...(currentData.spinControl || {}),
      };

      const sequence = [...(spinControl.sequence || [])];
      if (typeof index === "number" && index >= 0 && index < sequence.length && prize) {
        sequence[index] = String(prize).trim();
        spinControl.sequence = sequence;

        const { error: updateErr } = await supabase.from("site_content").update({
          data: { ...currentData, spinControl },
          updated_at: new Date().toISOString(),
        }).eq("id", contentRow.id);

        if (updateErr) throw new Error(updateErr.message);
        return NextResponse.json({ ok: true, spinControl });
      }

      return NextResponse.json({ error: "Invalid sequence index or prize." }, { status: 400 });
    }

    // 10. Reset Sequence to Default (101 Cards Sequence)
    if (action === "reset_sequence") {
      const { getDefaultSpinControl } = await import("@/lib/spinServer");
      const { PREASSIGNED_SPIN_CODES } = await import("@/data/spinCodesData");
      const { data: contentRow } = await supabase.from("site_content").select("id, data").limit(1).maybeSingle();
      if (!contentRow || !contentRow.id) {
        return NextResponse.json({ error: "site_content table row not found." }, { status: 500 });
      }

      const currentData = contentRow.data || {};
      const spinControl = {
        ...getDefaultSpinControl(),
        ...(currentData.spinControl || {}),
        sequence: PREASSIGNED_SPIN_CODES.map((c) => c.prize),
      };

      const { error: updateErr } = await supabase.from("site_content").update({
        data: { ...currentData, spinControl },
        updated_at: new Date().toISOString(),
      }).eq("id", contentRow.id);

      if (updateErr) throw new Error(updateErr.message);
      return NextResponse.json({ ok: true, spinControl });
    }

    // 11. Reset Spin Counter / Index
    if (action === "reset_spin_counter") {
      const targetIndex = typeof body.index === "number" ? body.index : 0;
      const { getDefaultSpinControl } = await import("@/lib/spinServer");
      const { data: contentRow } = await supabase.from("site_content").select("id, data").limit(1).maybeSingle();
      if (!contentRow || !contentRow.id) {
        return NextResponse.json({ error: "site_content table row not found." }, { status: 500 });
      }

      const currentData = contentRow.data || {};
      const spinControl = {
        ...getDefaultSpinControl(),
        ...(currentData.spinControl || {}),
        current_spin_index: targetIndex,
      };

      const { error: updateErr } = await supabase.from("site_content").update({
        data: { ...currentData, spinControl },
        updated_at: new Date().toISOString(),
      }).eq("id", contentRow.id);

      if (updateErr) throw new Error(updateErr.message);
      return NextResponse.json({ ok: true, spinControl });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("[POST /api/admin/spin error]", error);
    return NextResponse.json({ error: error?.message || "Failed to execute spin action." }, { status: 500 });
  }
}
