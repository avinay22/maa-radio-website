import { createClient } from "@supabase/supabase-js";
import { SpinReward, SpinPlayResponse } from "./spinTypes";
import { PREASSIGNED_SPIN_CODES } from "@/data/spinCodesData";

export function getSupabaseBackend() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables.");
  }

  return createClient(url, key);
}

// In-memory fallback if database migration hasn't been executed yet
const memoryState = {
  isActive: true,
  totalSpins: 0,
  rewards: [
    { id: "1", reward_name: "TV", milestone: 101, type: "milestone", enabled: true },
    { id: "2", reward_name: "Special Gift", milestone: 30, type: "milestone", enabled: true },
    { id: "3", reward_name: "BT Speaker", milestone: 20, type: "milestone", enabled: true },
    { id: "4", reward_name: "Headphone", milestone: 15, type: "milestone", enabled: true },
    { id: "5", reward_name: "Earbuds", milestone: 5, type: "milestone", enabled: true },
    { id: "6", reward_name: "Cup", milestone: null, type: "random", enabled: true },
    { id: "7", reward_name: "Neckband", milestone: null, type: "random", enabled: true },
    { id: "8", reward_name: "Data Cable", milestone: null, type: "random", enabled: true },
  ] as SpinReward[],
  codes: new Map<string, { card: number; prize: string; used: boolean; used_at: string | null }>(
    PREASSIGNED_SPIN_CODES.map((item) => [
      item.code.toUpperCase(),
      { card: item.card, prize: item.prize, used: false, used_at: null },
    ])
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// Public Wheel Status
// ─────────────────────────────────────────────────────────────────────────────
export async function getSpinPublicStatus() {
  try {
    const supabase = getSupabaseBackend();

    const [settingsRes, rewardsRes, statsRes] = await Promise.all([
      supabase.from("spin_settings").select("is_active").eq("id", "global").maybeSingle(),
      supabase.from("spin_rewards").select("id, reward_name, type, milestone").eq("enabled", true).order("created_at", { ascending: true }),
      supabase.from("spin_stats").select("total_spins").eq("id", "global").maybeSingle(),
    ]);

    if (!settingsRes.error && !rewardsRes.error && rewardsRes.data && rewardsRes.data.length > 0) {
      return {
        isActive: settingsRes.data?.is_active ?? true,
        rewards: rewardsRes.data,
        totalSpins: statsRes.data?.total_spins || 0,
        source: "supabase",
      };
    }
  } catch (err) {
    console.warn("[getSpinPublicStatus] Using fallback memory:", err);
  }

  // Graceful fallback
  return {
    isActive: memoryState.isActive,
    rewards: memoryState.rewards.filter((r) => r.enabled),
    totalSpins: memoryState.totalSpins,
    source: "local_fallback",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Process Spin Play (Backend Control with 101 Pre-Assigned Codes)
// ─────────────────────────────────────────────────────────────────────────────
export async function processSpinPlay(codeRaw: string): Promise<SpinPlayResponse> {
  const code = (codeRaw || "").trim().toUpperCase();
  if (!code) {
    return { ok: false, error: "Please enter your card spin code." };
  }

  try {
    const supabase = getSupabaseBackend();

    // 1. Check if spin is active
    const { data: setting, error: settingErr } = await supabase
      .from("spin_settings")
      .select("is_active")
      .eq("id", "global")
      .maybeSingle();

    if (!settingErr && setting && !setting.is_active) {
      return { ok: false, error: "Spin the Wheel is currently inactive." };
    }

    // 2. Query the code from Supabase spin_codes table
    const { data: codeRow, error: codeErr } = await supabase
      .from("spin_codes")
      .select("*")
      .ilike("code", code)
      .maybeSingle();

    if (!codeErr && codeRow) {
      // Security Check: One code = One spin ONLY
      if (codeRow.used) {
        const usedDate = codeRow.used_at
          ? new Date(codeRow.used_at).toLocaleDateString()
          : "earlier";
        return {
          ok: false,
          error: `This code (${code}) has already been used on ${usedDate} (Prize: ${codeRow.prize}). It cannot be used again.`,
        };
      }

      // Fetch enabled wheel rewards to find matching slice
      const { data: rewards } = await supabase
        .from("spin_rewards")
        .select("*")
        .eq("enabled", true)
        .order("created_at", { ascending: true });

      const activeRewards = rewards && rewards.length > 0 ? rewards : memoryState.rewards;

      // Increment total_spins
      let nextTotal = 1;
      const { data: statsRow } = await supabase
        .from("spin_stats")
        .select("total_spins")
        .eq("id", "global")
        .maybeSingle();

      if (statsRow && typeof statsRow.total_spins === "number") {
        nextTotal = statsRow.total_spins + 1;
        await supabase
          .from("spin_stats")
          .update({ total_spins: nextTotal, updated_at: new Date().toISOString() })
          .eq("id", "global");
      } else {
        await supabase
          .from("spin_stats")
          .upsert({ id: "global", total_spins: nextTotal, updated_at: new Date().toISOString() });
      }

      // Exact Pre-Assigned Prize
      const prizeName = codeRow.prize;

      // Find slice index of this prize on the wheel
      const normalizedPrize = prizeName.trim().toLowerCase();
      let sliceIndex = activeRewards.findIndex(
        (r: any) => r.reward_name.trim().toLowerCase() === normalizedPrize
      );
      if (sliceIndex === -1) {
        // Fallback match (e.g. "Brand Cup" vs "Cup")
        sliceIndex = activeRewards.findIndex(
          (r: any) =>
            r.reward_name.toLowerCase().includes(normalizedPrize) ||
            normalizedPrize.includes(r.reward_name.toLowerCase())
        );
      }
      if (sliceIndex === -1) sliceIndex = 0;

      // Mark code as USED in Supabase
      await supabase
        .from("spin_codes")
        .update({
          used: true,
          used_at: new Date().toISOString(),
        })
        .eq("id", codeRow.id);

      return {
        ok: true,
        prize: prizeName,
        sliceIndex,
        totalSpins: nextTotal,
      };
    }
  } catch (err: any) {
    console.warn("[processSpinPlay DB exception, using fallback dataset]:", err?.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Local Fallback Dataset Execution (100% Identical Behavior)
  // ─────────────────────────────────────────────────────────────────────────────
  if (!memoryState.isActive) {
    return { ok: false, error: "Spin the Wheel is currently inactive." };
  }

  const memoryCode = memoryState.codes.get(code);
  if (!memoryCode) {
    return {
      ok: false,
      error: `Invalid code '${code}'. Please check the code printed on your card.`,
    };
  }

  if (memoryCode.used) {
    return {
      ok: false,
      error: `This code (${code}) has already been used (Prize: ${memoryCode.prize}). It cannot be used again.`,
    };
  }

  // Mark as used
  memoryCode.used = true;
  memoryCode.used_at = new Date().toISOString();
  memoryState.totalSpins += 1;

  const prizeName = memoryCode.prize;
  const activeRewards = memoryState.rewards.filter((r) => r.enabled);

  const normalizedPrize = prizeName.trim().toLowerCase();
  let sliceIndex = activeRewards.findIndex(
    (r) => r.reward_name.trim().toLowerCase() === normalizedPrize
  );
  if (sliceIndex === -1) {
    sliceIndex = activeRewards.findIndex(
      (r) =>
        r.reward_name.toLowerCase().includes(normalizedPrize) ||
        normalizedPrize.includes(r.reward_name.toLowerCase())
    );
  }
  if (sliceIndex === -1) sliceIndex = 0;

  return {
    ok: true,
    prize: prizeName,
    sliceIndex,
    totalSpins: memoryState.totalSpins,
  };
}
