export interface SpinSettings {
  id?: string;
  is_active: boolean;
  updated_at?: string;
}

export interface SpinReward {
  id: string;
  reward_name: string;
  image_url?: string | null;
  milestone: number | null;
  type: "random" | "milestone";
  enabled: boolean;
  created_at?: string;
}

export interface SpinCode {
  id: string;
  card_number?: number | null;
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

export interface SpinControlHistoryItem {
  id: string;
  spin_number: number;
  prize: string;
  winner_name?: string | null;
  winner_phone?: string | null;
  created_at: string;
}

export interface SpinControlConfig {
  mode: "sequence" | "manual_next" | "random";
  require_code: boolean; // false = Direct Spin (Default!), true = Code Required
  next_prize: string | null; // Immediate override prize if set
  current_spin_index: number; // Current position in sequence
  sequence: string[]; // List of upcoming prizes in order
  history: SpinControlHistoryItem[];
}

export interface SpinStatusResponse {
  isActive: boolean;
  rewards: Array<{
    id: string;
    reward_name: string;
    image_url?: string | null;
    type: "random" | "milestone";
  }>;
  totalSpins: number;
  requireCode?: boolean;
}

export interface SpinPlayResponse {
  ok: boolean;
  prize?: string;
  sliceIndex?: number;
  rewardId?: string;
  totalSpins?: number;
  spinNumber?: number;
  error?: string;
}

