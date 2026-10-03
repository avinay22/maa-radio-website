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
    { id: "1", reward_name: "Flat ₹100 OFF", milestone: null, type: "random", enabled: true },
    { id: "2", reward_name: "10% OFF Coupon", milestone: null, type: "random", enabled: true },
    { id: "3", reward_name: "Free Screen Guard", milestone: null, type: "random", enabled: true },
    { id: "4", reward_name: "5% Extra Discount", milestone: null, type: "random", enabled: true },
    { id: "5", reward_name: "Better Luck Next Time", milestone: null, type: "random", enabled: true },
    { id: "6", reward_name: "Jackpot: ₹1000 OFF", milestone: 10, type: "milestone", enabled: true },
  ] as SpinReward[],
  codes: new Map<string, { used: boolean; prize: string | null; used_at: string | null }>([
    ["MAA100", { used: false, prize: null, used_at: null }],
    ["LUCKY2026", { used: false, prize: null, used_at: null }],
    ["VIPSPIN", { used: false, prize: null, used_at: null }],
    ["TESTCODE", { used: false, prize: null, used_at: null }],
  ]),
};

export async function getSpinPublicStatus() {
  try {
    const supabase = getSupabaseBackend();

    const [settingsRes, rewardsRes, statsRes] = await Promise.all([
      supabase.from("spin_settings").select("is_active").eq("id", "global").maybeSingle(),
      supabase.from("spin_rewards").select("id, reward_name, type").eq("enabled", true).order("created_at", { ascending: true }),
      supabase.from("spin_stats").select("total_spins").eq("id", "global").maybeSingle(),
    ]);

    // If tables exist in Supabase
    if (!settingsRes.error && !rewardsRes.error) {
      return {
        isActive: settingsRes.data?.is_active ?? true,
        rewards: rewardsRes.data && rewardsRes.data.length > 0
          ? rewardsRes.data
          : memoryState.rewards.map(r => ({ id: r.id, reward_name: r.reward_name, type: r.type })),
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
    rewards: memoryState.rewards.filter(r => r.enabled).map(r => ({ id: r.id, reward_name: r.reward_name, type: r.type })),
    totalSpins: memoryState.totalSpins,
    source: "local_fallback",
  };
}

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

      // 5. Increment total_spins
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

      // 6. Reward Logic: Check Milestone vs Random
      let winningReward: SpinReward | null = null;

      // Check if any milestone reward matches current spin number or interval
      const milestoneRewards = (rewards as SpinReward[]).filter(
        (r) => r.type === "milestone" && r.milestone && r.milestone > 0
      );

      const matchedMilestone = milestoneRewards.find(
        (r) => r.milestone === nextTotal || (r.milestone! > 1 && nextTotal % r.milestone! === 0)
      );

      if (matchedMilestone) {
        winningReward = matchedMilestone;
      } else {
        // Random selection from enabled random rewards
        const randomRewards = (rewards as SpinReward[]).filter((r) => r.type === "random");
        const pool = randomRewards.length > 0 ? randomRewards : (rewards as SpinReward[]);
        const randomIndex = Math.floor(Math.random() * pool.length);
        winningReward = pool[randomIndex];
      }

      const prizeName = winningReward.reward_name;

      // Find index in the original list for wheel animation alignment
      const sliceIndex = rewards.findIndex((r) => r.id === winningReward!.id);

      // 7. Mark Code as Used & Record Prize
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

  // Local in-memory execution fallback (works even before user runs SQL migration!)
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

  const enabledRewards = memoryState.rewards.filter((r) => r.enabled);
  const matchedMilestone = enabledRewards.find(
    (r) => r.type === "milestone" && r.milestone && (r.milestone === currentTotal || currentTotal % r.milestone === 0)
  );

  let selected: SpinReward;
  if (matchedMilestone) {
    selected = matchedMilestone;
  } else {
    const randomPool = enabledRewards.filter((r) => r.type === "random");
    const pool = randomPool.length > 0 ? randomPool : enabledRewards;
    selected = pool[Math.floor(Math.random() * pool.length)];
  }

  existingCode.used = true;
  existingCode.prize = selected.reward_name;
  existingCode.used_at = new Date().toISOString();

  const sliceIdx = enabledRewards.findIndex((r) => r.id === selected.id);

  return {
    ok: true,
    prize: selected.reward_name,
    sliceIndex: sliceIdx >= 0 ? sliceIdx : 0,
    rewardId: selected.id,
    totalSpins: currentTotal,
  };
}
