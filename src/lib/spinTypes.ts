export interface SpinSettings {
  id?: string;
  is_active: boolean;
  updated_at?: string;
}

export interface SpinReward {
  id: string;
  reward_name: string;
  milestone: number | null;
  type: "random" | "milestone";
  enabled: boolean;
  created_at?: string;
}

export interface SpinCode {
  id: string;
  code: string;
  used: boolean;
  prize: string | null;
  used_at: string | null;
  created_at?: string;
}

export interface SpinStats {
  id?: string;
  total_spins: number;
  updated_at?: string;
}

export interface SpinStatusResponse {
  isActive: boolean;
  rewards: Array<{
    id: string;
    reward_name: string;
    type: "random" | "milestone";
  }>;
  totalSpins: number;
}

export interface SpinPlayResponse {
  ok: boolean;
  prize?: string;
  sliceIndex?: number;
  rewardId?: string;
  totalSpins?: number;
  error?: string;
}
