import { createClient } from "@supabase/supabase-js";
import {
  SpinReward,
  SpinPlayResponse,
  SpinControlConfig,
  SpinControlHistoryItem,
  SpinStatusResponse,
} from "./spinTypes";
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

export const DEFAULT_REWARD_IMAGES: Record<string, string> = {
  "TV": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&auto=format&fit=crop&q=80",
  "Special Gift": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&auto=format&fit=crop&q=80",
  "BT Speaker": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&auto=format&fit=crop&q=80",
  "Headphone": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80",
  "Earbuds": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&auto=format&fit=crop&q=80",
  "Cup": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80",
  "Brand Cup": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80",
  "Neckband": "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=300&auto=format&fit=crop&q=80",
  "Data Cable": "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=300&auto=format&fit=crop&q=80",
};

export function resolveRewardImage(rewardName: string, customImage?: string | null): string {
  if (customImage && customImage.trim()) return customImage.trim();
  const trimmed = (rewardName || "").trim();
  if (DEFAULT_REWARD_IMAGES[trimmed]) return DEFAULT_REWARD_IMAGES[trimmed];
  const lower = trimmed.toLowerCase();
  for (const [key, url] of Object.entries(DEFAULT_REWARD_IMAGES)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return url;
    }
  }
  return "";
}

export function getDefaultSpinControl(): SpinControlConfig {
  return {
    mode: "sequence",
    require_code: false, // Default: Direct 1-Click Spin! No code typing required
    next_prize: null, // One-click override if owner wants a specific prize next
    current_spin_index: 0,
    sequence: PREASSIGNED_SPIN_CODES.map((c) => c.prize),
    history: [],
  };
}

// In-memory fallback if database migration hasn't been executed yet
const memoryState = {
  isActive: true,
  totalSpins: 0,
  control: getDefaultSpinControl(),
  rewards: [
    { id: "1", reward_name: "TV", image_url: DEFAULT_REWARD_IMAGES["TV"], milestone: 101, type: "milestone", enabled: true },
    { id: "2", reward_name: "Special Gift", image_url: DEFAULT_REWARD_IMAGES["Special Gift"], milestone: 30, type: "milestone", enabled: true },
    { id: "3", reward_name: "BT Speaker", image_url: DEFAULT_REWARD_IMAGES["BT Speaker"], milestone: 20, type: "milestone", enabled: true },
    { id: "4", reward_name: "Headphone", image_url: DEFAULT_REWARD_IMAGES["Headphone"], milestone: 15, type: "milestone", enabled: true },
    { id: "5", reward_name: "Earbuds", image_url: DEFAULT_REWARD_IMAGES["Earbuds"], milestone: 5, type: "milestone", enabled: true },
    { id: "6", reward_name: "Cup", image_url: DEFAULT_REWARD_IMAGES["Cup"], milestone: null, type: "random", enabled: true },
    { id: "7", reward_name: "Neckband", image_url: DEFAULT_REWARD_IMAGES["Neckband"], milestone: null, type: "random", enabled: true },
    { id: "8", reward_name: "Data Cable", image_url: DEFAULT_REWARD_IMAGES["Data Cable"], milestone: null, type: "random", enabled: true },
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

    const [settingsRes, rewardsRes, statsRes, contentRes] = await Promise.all([
      supabase.from("spin_settings").select("is_active").eq("id", "global").maybeSingle(),
      supabase.from("spin_rewards").select("*").eq("enabled", true).order("created_at", { ascending: true }),
      supabase.from("spin_stats").select("total_spins").eq("id", "global").maybeSingle(),
      supabase.from("site_content").select("data").limit(1).maybeSingle(),
    ]);

    const contentData = contentRes.data?.data || {};
    const storedRewardImages: Record<string, string> =
      (typeof contentData === "object" && (contentData as any).spinRewardImages) || {};
    const spinControl: SpinControlConfig =
      (typeof contentData === "object" && (contentData as any).spinControl) || getDefaultSpinControl();

    if (!settingsRes.error && !rewardsRes.error && rewardsRes.data && rewardsRes.data.length > 0) {
      const enrichedRewards = rewardsRes.data.map((r: any) => ({
        id: r.id,
        reward_name: r.reward_name,
        type: r.type,
        milestone: r.milestone,
        image_url: resolveRewardImage(
          r.reward_name,
          r.image_url || storedRewardImages[r.id] || storedRewardImages[r.reward_name]
        ),
      }));

      return {
        isActive: settingsRes.data?.is_active ?? true,
        rewards: enrichedRewards,
        totalSpins: statsRes.data?.total_spins || 0,
        requireCode: Boolean(spinControl.require_code),
        source: "supabase",
      };
    }
  } catch (err) {
    console.warn("[getSpinPublicStatus] Using fallback memory:", err);
  }

  // Graceful fallback
  return {
    isActive: memoryState.isActive,
    rewards: memoryState.rewards.filter((r) => r.enabled).map((r) => ({
      id: r.id,
      reward_name: r.reward_name,
      type: r.type,
      milestone: r.milestone,
      image_url: resolveRewardImage(r.reward_name, r.image_url),
    })),
    totalSpins: memoryState.totalSpins,
    requireCode: Boolean(memoryState.control.require_code),
    source: "local_fallback",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Direct Spin Play (No Code Needed - Admin Controlled Next Prize & Sequence)
// ─────────────────────────────────────────────────────────────────────────────
export async function processDirectSpinPlay(opts?: {
  name?: string;
  phone?: string;
}): Promise<SpinPlayResponse> {
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

    // 2. Fetch site_content and enabled rewards
    const [contentRes, rewardsRes, statsRes] = await Promise.all([
      supabase.from("site_content").select("id, data").limit(1).maybeSingle(),
      supabase.from("spin_rewards").select("*").eq("enabled", true).order("created_at", { ascending: true }),
      supabase.from("spin_stats").select("total_spins").eq("id", "global").maybeSingle(),
    ]);

    const activeRewards =
      rewardsRes.data && rewardsRes.data.length > 0
        ? rewardsRes.data
        : memoryState.rewards.filter((r) => r.enabled);

    const contentRow = contentRes.data;
    const contentData = contentRow?.data || {};
    const control: SpinControlConfig = {
      ...getDefaultSpinControl(),
      ...(contentData.spinControl || {}),
    };

    // 3. Determine winning prize
    let winningPrize = "";

    // Priority A: Did admin force a specific Next Prize? (e.g. "Cup", "TV", etc.)
    if (control.next_prize && control.next_prize.trim()) {
      winningPrize = control.next_prize.trim();
      // Consume the manual override once used!
      control.next_prize = null;
      control.current_spin_index = (control.current_spin_index || 0) + 1;
    } else if (control.mode === "sequence") {
      // Priority B: Follow planned sequence (1st spin, 2nd spin, 3rd spin...)
      const seq =
        Array.isArray(control.sequence) && control.sequence.length > 0
          ? control.sequence
          : PREASSIGNED_SPIN_CODES.map((c) => c.prize);

      const currentIndex = control.current_spin_index || 0;
      winningPrize = seq[currentIndex % seq.length];
      control.current_spin_index = currentIndex + 1;
    } else {
      // Priority C: Random slice among enabled rewards
      const randomIdx = Math.floor(Math.random() * activeRewards.length);
      winningPrize = activeRewards[randomIdx]?.reward_name || "Cup";
      control.current_spin_index = (control.current_spin_index || 0) + 1;
    }

    // 4. Find exact slice index for visual wheel animation
    const normalizedPrize = winningPrize.trim().toLowerCase();
    let sliceIndex = activeRewards.findIndex(
      (r: any) => r.reward_name.trim().toLowerCase() === normalizedPrize
    );
    if (sliceIndex === -1) {
      sliceIndex = activeRewards.findIndex(
        (r: any) =>
          r.reward_name.toLowerCase().includes(normalizedPrize) ||
          normalizedPrize.includes(r.reward_name.toLowerCase())
      );
    }
    if (sliceIndex === -1) sliceIndex = 0;

    // 5. Increment spin count in spin_stats
    let nextTotal = 1;
    if (statsRes.data && typeof statsRes.data.total_spins === "number") {
      nextTotal = statsRes.data.total_spins + 1;
    }
    await supabase.from("spin_stats").upsert({
      id: "global",
      total_spins: nextTotal,
      updated_at: new Date().toISOString(),
    });

    // 6. Record history entry
    const historyItem: SpinControlHistoryItem = {
      id: String(Date.now()),
      spin_number: nextTotal,
      prize: winningPrize,
      winner_name: opts?.name?.trim() || null,
      winner_phone: opts?.phone?.trim() || null,
      created_at: new Date().toISOString(),
    };

    control.history = [historyItem, ...(control.history || [])].slice(0, 100);

    // 7. Persist back to site_content.data.spinControl
    if (contentRow && contentRow.id) {
      await supabase
        .from("site_content")
        .update({
          data: {
            ...contentData,
            spinControl: control,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", contentRow.id);
    }

    // Synchronize memory fallback
    memoryState.totalSpins = nextTotal;
    memoryState.control = control;

    return {
      ok: true,
      prize: winningPrize,
      sliceIndex,
      totalSpins: nextTotal,
      spinNumber: nextTotal,
    };
  } catch (err: any) {
    console.warn("[processDirectSpinPlay] DB exception, using fallback:", err);
  }

  // Fallback if DB unavailable
  if (!memoryState.isActive) {
    return { ok: false, error: "Spin the Wheel is currently inactive." };
  }

  const control = memoryState.control;
  let winningPrize = "";

  if (control.next_prize && control.next_prize.trim()) {
    winningPrize = control.next_prize.trim();
    control.next_prize = null;
    control.current_spin_index = (control.current_spin_index || 0) + 1;
  } else {
    const seq = control.sequence.length > 0 ? control.sequence : PREASSIGNED_SPIN_CODES.map((c) => c.prize);
    winningPrize = seq[(control.current_spin_index || 0) % seq.length];
    control.current_spin_index = (control.current_spin_index || 0) + 1;
  }

  memoryState.totalSpins += 1;
  const activeRewards = memoryState.rewards.filter((r) => r.enabled);
  const normalizedPrize = winningPrize.trim().toLowerCase();
  let sliceIndex = activeRewards.findIndex(
    (r) => r.reward_name.trim().toLowerCase() === normalizedPrize
  );
  if (sliceIndex === -1) sliceIndex = 0;

  return {
    ok: true,
    prize: winningPrize,
    sliceIndex,
    totalSpins: memoryState.totalSpins,
    spinNumber: memoryState.totalSpins,
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

export function markCodeUsedInMemory(codeRaw: string, used: boolean) {
  const code = (codeRaw || "").trim().toUpperCase();
  const item = memoryState.codes.get(code);
  if (item) {
    item.used = used;
    item.used_at = used ? new Date().toISOString() : null;
  }
}

