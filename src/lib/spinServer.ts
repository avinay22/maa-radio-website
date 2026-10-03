import { createClient } from "@supabase/supabase-js";
import { SpinReward, SpinPlayResponse } from "./spinTypes";

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
let memoryState = {
  isActive: true,
  totalSpins: 0,
  rewards: [
    { id: "1", reward_name: "TV", milestone: 101, type: "milestone", enabled: true },
    { id: "2", reward_name: "Special Gift", milestone: 30, type: "milestone", enabled: true },
    { id: "3", reward_name: "BT Speaker", milestone: 20, type: "milestone", enabled: true },
    { id: "4", reward_name: "Headphone", milestone: 15, type: "milestone", enabled: true },
    { id: "5", reward_name: "Earbuds", milestone: 5, type: "milestone", enabled: true },
    { id: "6", reward_name: "Brand Cup", milestone: null, type: "random", enabled: true },
    { id: "7", reward_name: "Neckband", milestone: null, type: "random", enabled: true },
    { id: "8", reward_name: "Data Cable", milestone: null, type: "random", enabled: true },
  ] as SpinReward[],
  codes: new Map<string, { used: boolean; prize: string | null; used_at: string | null }>([
    ["MAA100", { used: false, prize: null, used_at: null }],
    ["LUCKY2026", { used: false, prize: null, used_at: null }],
    ["VIPSPIN", { used: false, prize: null, used_at: null }],
    ["TESTCODE", { used: false, prize: null, used_at: null }],
  ]),
};

// ─────────────────────────────────────────────────────────────────────────────
// Core Milestone & Reward Selection Logic
// ─────────────────────────────────────────────────────────────────────────────
async function resolveSpinReward(
  supabase: any,
  totalSpins: number,
  allRewards: SpinReward[]
): Promise<SpinReward> {
  const enabledRewards = allRewards.filter((r) => r.enabled);

  const findReward = (name: string, milestone?: number) => {
    return enabledRewards.find(
      (r) =>
        r.reward_name.trim().toLowerCase() === name.toLowerCase() ||
        (milestone !== undefined && r.milestone === milestone)
    );
  };

  let milestoneReward: SpinReward | undefined;

  // 1. total_spins === 101 → TV (ONLY ONCE)
  if (totalSpins === 101) {
    let tvAlreadyGiven = false;
    if (supabase) {
      try {
        const { data: tvGiven } = await supabase
          .from("spin_codes")
          .select("id")
          .ilike("prize", "TV")
          .limit(1);
        if (tvGiven && tvGiven.length > 0) {
          tvAlreadyGiven = true;
        }
      } catch {
        // Continue if query error
      }
    } else {
      tvAlreadyGiven = Array.from(memoryState.codes.values()).some(
        (c) => c.prize?.toLowerCase() === "tv"
      );
    }

    if (!tvAlreadyGiven) {
      milestoneReward = findReward("TV", 101);
    }
  }
  // 2. total_spins === 30 → Special Gift
  else if (totalSpins === 30) {
    milestoneReward = findReward("Special Gift", 30);
  }
  // 3. total_spins === 20 → BT Speaker
  else if (totalSpins === 20) {
    milestoneReward = findReward("BT Speaker", 20);
  }
  // 4. total_spins === 15 → Headphone
  else if (totalSpins === 15) {
    milestoneReward = findReward("Headphone", 15);
  }
  // 5. total_spins === 5 → Earbuds
  else if (totalSpins === 5) {
    milestoneReward = findReward("Earbuds", 5);
  }
  // 6. Custom milestone from admin if defined
  else {
    milestoneReward = enabledRewards.find(
      (r) =>
        r.type === "milestone" &&
        r.milestone === totalSpins &&
        r.reward_name.toLowerCase() !== "tv"
    );
  }

  // If milestone matched, return it
  if (milestoneReward) {
    return milestoneReward;
  }

  // If no milestone matched → give random reward from Brand Cup, Neckband, Data Cable
  const randomPool = enabledRewards.filter((r) => r.type === "random");
  const pool = randomPool.length > 0 ? randomPool : enabledRewards;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

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

    // If tables exist in Supabase
    if (!settingsRes.error && !rewardsRes.error) {
      return {
        isActive: settingsRes.data?.is_active ?? true,
        rewards: rewardsRes.data && rewardsRes.data.length > 0
          ? rewardsRes.data
          : memoryState.rewards.map((r) => ({ id: r.id, reward_name: r.reward_name, type: r.type, milestone: r.milestone })),
        totalSpins: statsRes.data?.total_spins || 0,
        source: "supabase",
      };
    }
  } catch (err) {
    console.warn("[getSpinPublicStatus] Using fallback memory:", err);
  }

  // Graceful fallback if table is not yet created
  return {
    isActive: memoryState.isActive,
    rewards: memoryState.rewards.filter((r) => r.enabled).map((r) => ({ id: r.id, reward_name: r.reward_name, type: r.type, milestone: r.milestone })),
    totalSpins: memoryState.totalSpins,
    source: "local_fallback",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Process Spin Play (Backend Control)
// ─────────────────────────────────────────────────────────────────────────────
export async function processSpinPlay(codeRaw: string): Promise<SpinPlayResponse> {
  const code = (codeRaw || "").trim().toUpperCase();
  if (!code) {
    return { ok: false, error: "Please enter a valid spin code." };
  }

  try {
    const supabase = getSupabaseBackend();

    // 1. Check if tables exist by querying settings
    const { data: setting, error: settingErr } = await supabase
      .from("spin_settings")
      .select("is_active")
      .eq("id", "global")
      .maybeSingle();

    if (!settingErr) {
      // 2. Validate Spin Active
      if (setting && !setting.is_active) {
        return { ok: false, error: "Spin the Wheel is currently inactive." };
      }

      // 3. Query Code
      const { data: codeRow, error: codeErr } = await supabase
        .from("spin_codes")
        .select("*")
        .ilike("code", code)
        .maybeSingle();

      if (codeErr || !codeRow) {
        return { ok: false, error: `Invalid code '${code}'. Please check and try again.` };
      }

      if (codeRow.used) {
        return {
          ok: false,
          error: `This code has already been used on ${codeRow.used_at ? new Date(codeRow.used_at).toLocaleDateString() : "earlier"} (Prize: ${codeRow.prize || "Claimed"}).`,
        };
      }

      // 4. Fetch enabled rewards
      const { data: rewards, error: rewErr } = await supabase
        .from("spin_rewards")
        .select("*")
        .eq("enabled", true)
        .order("created_at", { ascending: true });

      if (rewErr || !rewards || rewards.length === 0) {
        return { ok: false, error: "No active rewards configured at the moment." };
      }

      // 5. Increment total_spins by 1
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

      // 6. Reward Logic: Check Milestone First (TV at 101, Special Gift at 30, BT Speaker at 20, Headphone at 15, Earbuds at 5)
      // Otherwise random from (Brand Cup, Neckband, Data Cable)
      const winningReward = await resolveSpinReward(supabase, nextTotal, rewards as SpinReward[]);
      const prizeName = winningReward.reward_name;

      // Find slice index in the visual rewards array for accurate wheel alignment
      const sliceIndex = rewards.findIndex((r) => r.id === winningReward.id);

      // 7. Mark Code as Used & Record Prize in Database
      await supabase
        .from("spin_codes")
        .update({
          used: true,
          prize: prizeName,
          used_at: new Date().toISOString(),
        })
        .eq("id", codeRow.id);

      return {
        ok: true,
        prize: prizeName,
        sliceIndex: sliceIndex >= 0 ? sliceIndex : 0,
        rewardId: winningReward.id,
        totalSpins: nextTotal,
      };
    }
  } catch (err: any) {
    console.warn("[processSpinPlay DB exception, using fallback]:", err?.message);
  }

  // Local fallback (if offline or DB not yet created)
  if (!memoryState.isActive) {
    return { ok: false, error: "Spin the Wheel is currently inactive." };
  }

  const existingCode = memoryState.codes.get(code);
  if (!existingCode) {
    return { ok: false, error: `Invalid code '${code}'. Try MAA100 or LUCKY2026.` };
  }

  if (existingCode.used) {
    return {
      ok: false,
      error: `This code has already been redeemed (Prize: ${existingCode.prize}).`,
    };
  }

  memoryState.totalSpins += 1;
  const currentTotal = memoryState.totalSpins;

  const winningReward = await resolveSpinReward(null, currentTotal, memoryState.rewards);

  existingCode.used = true;
  existingCode.prize = winningReward.reward_name;
  existingCode.used_at = new Date().toISOString();

  const enabledList = memoryState.rewards.filter((r) => r.enabled);
  const sliceIdx = enabledList.findIndex((r) => r.id === winningReward.id);

  return {
    ok: true,
    prize: winningReward.reward_name,
    sliceIndex: sliceIdx >= 0 ? sliceIdx : 0,
    rewardId: winningReward.id,
    totalSpins: currentTotal,
  };
}
