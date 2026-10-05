"use client";

import React, { useState, useEffect } from "react";
import {
  RotateCw, Plus, Trash2, Edit2, CheckCircle, AlertCircle,
  ToggleLeft, ToggleRight, Sparkles, Gift, Key, Layers, Loader2, RefreshCw, Printer, Search, RotateCcw, ImageIcon,
  Target, Check, Zap, Play, History, ArrowRight, ChevronRight, Sliders, ListOrdered
} from "lucide-react";
import { SpinReward, SpinCode, SpinSettings, SpinStats, SpinControlConfig } from "@/lib/spinTypes";
import ImageUploader from "@/components/ImageUploader";

export default function SpinWheelAdminTab({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [settings, setSettings] = useState<SpinSettings>({ is_active: true });
  const [stats, setStats] = useState<SpinStats>({ total_spins: 0 });
  const [rewards, setRewards] = useState<SpinReward[]>([]);
  const [codes, setCodes] = useState<SpinCode[]>([]);
  const [spinControl, setSpinControl] = useState<SpinControlConfig | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"director" | "slices" | "codes">("director");

  // Reward Edit Form state
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [rewardName, setRewardName] = useState("");
  const [rewardImageUrl, setRewardImageUrl] = useState("");
  const [rewardType, setRewardType] = useState<"random" | "milestone">("random");
  const [rewardMilestone, setRewardMilestone] = useState<string>("");
  const [rewardEnabled, setRewardEnabled] = useState(true);

  // Code Generation Form state
  const [customCode, setCustomCode] = useState("");
  const [codeCount, setCodeCount] = useState<number>(5);
  const [generatingCode, setGeneratingCode] = useState(false);

  // Fetch admin spin data
  const loadData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/spin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load spin settings.");

      setSettings(data.settings || { is_active: true });
      setStats(data.stats || { total_spins: 0 });
      setRewards(data.rewards || []);
      setCodes(data.codes || []);
      setSpinControl(data.spinControl || null);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  // 1. Toggle ON / OFF
  const handleToggleActive = async () => {
    const nextState = !settings.is_active;
    setSaving(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/spin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "toggle_active", isActive: nextState }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update toggle.");

      setSettings({ ...settings, is_active: nextState });
      showNotification(`Spin Wheel is now ${nextState ? "ACTIVE (ON)" : "PAUSED (OFF)"}`);
    } catch (err: any) {
      setErrorMsg(err?.message);
    } finally {
      setSaving(false);
    }
  };

  // 1B. Set Next Prize Target (Instant 1-Click Winner for Next Spin)
  const handleSetNextPrize = async (prizeName: string | null) => {
    setSaving(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/spin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "set_next_prize", nextPrize: prizeName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to set next prize.");

      setSpinControl(data.spinControl);
      showNotification(
        prizeName
          ? `Target set! Next customer will win "${prizeName}".`
          : "Override removed. Next spin will follow sequence order."
      );
    } catch (err: any) {
      setErrorMsg(err?.message);
    } finally {
      setSaving(false);
    }
  };

  // 1C. Toggle Require Code (Direct Spin vs Card Code Mode)
  const handleToggleRequireCode = async (requireCode: boolean) => {
    setSaving(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/spin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "update_spin_control",
          spinControl: { require_code: requireCode },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update code mode.");

      setSpinControl(data.spinControl);
      showNotification(
        requireCode
          ? "Code Mode: Customers must now enter a scratch card code to spin."
          : "Direct Spin Mode: Customers can now tap to spin directly without typing codes!"
      );
    } catch (err: any) {
      setErrorMsg(err?.message);
    } finally {
      setSaving(false);
    }
  };

  // 1D. Update Specific Sequence Step
  const handleUpdateSequenceItem = async (index: number, prize: string) => {
    try {
      const res = await fetch("/api/admin/spin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "update_sequence_item", index, prize }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update sequence step.");

      setSpinControl(data.spinControl);
      showNotification(`Spin #${index + 1} updated to "${prize}".`);
    } catch (err: any) {
      setErrorMsg(err?.message);
    }
  };

  // 1E. Reset Sequence to Standard 101 Sequence
  const handleResetSequence = async () => {
    if (!confirm("Reset the spin sequence queue to the standard 101 prizes sequence?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/spin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "reset_sequence" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset sequence.");

      setSpinControl(data.spinControl);
      showNotification("Sequence reset to standard 101 prizes.");
    } catch (err: any) {
      setErrorMsg(err?.message);
    } finally {
      setSaving(false);
    }
  };

  // 1F. Reset Queue Counter
  const handleResetSpinCounter = async (targetIndex = 0) => {
    if (!confirm(`Reset the spin queue counter to Spin #${targetIndex + 1}?`)) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/spin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "reset_spin_counter", index: targetIndex }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset spin counter.");

      setSpinControl(data.spinControl);
      showNotification(`Queue position set to Spin #${targetIndex + 1}.`);
    } catch (err: any) {
      setErrorMsg(err?.message);
    } finally {
      setSaving(false);
    }
  };

  // 2. Save / Update Reward (Names & Photos)
  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardName.trim()) {
      setErrorMsg("Reward name cannot be empty.");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    try {
      const payload = {
        id: editingRewardId || undefined,
        reward_name: rewardName.trim(),
        image_url: rewardImageUrl.trim() || null,
        type: rewardType,
        milestone: rewardType === "milestone" ? parseInt(rewardMilestone, 10) || 10 : null,
        enabled: rewardEnabled,
      };

      const res = await fetch("/api/admin/spin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "save_reward", reward: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save reward.");

      // Refresh list
      await loadData();
      resetRewardForm();
      showNotification("Reward saved successfully with updated name and photo!");
    } catch (err: any) {
      setErrorMsg(err?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditReward = (reward: SpinReward) => {
    setEditingRewardId(reward.id);
    setRewardName(reward.reward_name);
    setRewardImageUrl(reward.image_url || "");
    setRewardType(reward.type);
    setRewardMilestone(reward.milestone ? String(reward.milestone) : "");
    setRewardEnabled(reward.enabled);
  };

  const resetRewardForm = () => {
    setEditingRewardId(null);
    setRewardName("");
    setRewardImageUrl("");
    setRewardType("random");
    setRewardMilestone("");
    setRewardEnabled(true);
  };

  // 3. Delete Reward
  const handleDeleteReward = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reward?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/spin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "delete_reward", id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete.");

      setRewards(rewards.filter((r) => r.id !== id));
      showNotification("Reward deleted.");
    } catch (err: any) {
      setErrorMsg(err?.message);
    } finally {
      setSaving(false);
    }
  };

  // 4. Generate Codes
  const handleGenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingCode(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/spin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "create_codes",
          customCode: customCode.trim() || undefined,
          count: customCode.trim() ? 1 : codeCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create codes.");

      setCustomCode("");
      await loadData();
      showNotification("Spin access code(s) created!");
    } catch (err: any) {
      setErrorMsg(err?.message);
    } finally {
      setGeneratingCode(false);
    }
  };

  // 5. Delete Code
  const handleDeleteCode = async (id: string) => {
    try {
      const res = await fetch("/api/admin/spin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "delete_code", id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete code.");

      setCodes(codes.filter((c) => c.id !== id));
      showNotification("Code deleted.");
    } catch (err: any) {
      setErrorMsg(err?.message);
    }
  };

  // 6. Toggle Code Claimed / Unclaimed Status
  const handleToggleCodeStatus = async (code: string, id: string, nextUsed: boolean) => {
    setCodes((prev) =>
      prev.map((c) =>
        c.code === code
          ? { ...c, used: nextUsed, used_at: nextUsed ? new Date().toISOString() : null }
          : c
      )
    );

    try {
      const res = await fetch("/api/admin/spin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "toggle_code_used", id, code, used: nextUsed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update code status.");

      showNotification(`Card ${code} marked as ${nextUsed ? "CLAIMED" : "AVAILABLE (UNCLAIMED)"}`);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update status.");
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="animate-spin text-[#7A2E2E] mx-auto mb-3" size={28} />
        <p className="text-xs font-bold uppercase tracking-wider text-[#666666]">
          Loading Spin Wheel Configuration…
        </p>
      </div>
    );
  }

  const usedCodesCount = codes.filter((c) => c.used).length;
  const currentSpinIndex = spinControl?.current_spin_index || 0;
  const currentSequence = spinControl?.sequence || [];
  const nextScheduledPrize =
    currentSequence.length > 0
      ? currentSequence[currentSpinIndex % currentSequence.length]
      : "Cup";

  return (
    <div className="p-6 md:p-10 space-y-8 bg-white min-h-[600px]">
      {/* Toast Messages */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg">
          <CheckCircle size={15} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-lg">
          <AlertCircle size={15} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Top Banner: Master Toggle + Live Stats */}
      <div className="bg-[#F8F8F6] border border-[#E2E2DF] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-[#8A6A44]" />
            <h2 className="text-base font-extrabold uppercase tracking-wider text-[#222222]">
              Spin Wheel Master Control
            </h2>
          </div>
          <p className="text-xs text-[#666666]">
            Toggle the public spin wheel availability and monitor customer engagement.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleActive}
            disabled={saving}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              settings.is_active
                ? "bg-[#7A2E2E] text-white border-[#7A2E2E] hover:bg-[#5F2222]"
                : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300"
            }`}
          >
            {settings.is_active ? (
              <>
                <ToggleRight size={22} className="text-emerald-300" />
                Spin Active (ON)
              </>
            ) : (
              <>
                <ToggleLeft size={22} className="text-gray-500" />
                Spin Paused (OFF)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-[#E2E2DF] p-4 rounded-xl bg-white">
          <span className="text-[10px] font-bold uppercase text-[#888888] tracking-wider block mb-1">
            Total Spins Executed
          </span>
          <span className="text-2xl font-black text-[#222222]">
            {stats.total_spins}
          </span>
        </div>
        <div className="border border-[#E2E2DF] p-4 rounded-xl bg-white">
          <span className="text-[10px] font-bold uppercase text-[#888888] tracking-wider block mb-1">
            Active Rewards
          </span>
          <span className="text-2xl font-black text-[#8A6A44]">
            {rewards.filter((r) => r.enabled).length} / {rewards.length}
          </span>
        </div>
        <div className="border border-[#E2E2DF] p-4 rounded-xl bg-white">
          <span className="text-[10px] font-bold uppercase text-[#888888] tracking-wider block mb-1">
            Generated Codes
          </span>
          <span className="text-2xl font-black text-[#222222]">
            {codes.length}
          </span>
        </div>
        <div className="border border-[#E2E2DF] p-4 rounded-xl bg-white">
          <span className="text-[10px] font-bold uppercase text-[#888888] tracking-wider block mb-1">
            Codes Claimed
          </span>
          <span className="text-2xl font-black text-[#7A2E2E]">
            {usedCodesCount}
          </span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E2DF] pb-3 pt-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab("director")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === "director"
              ? "bg-[#7A2E2E] text-white shadow-sm"
              : "bg-white text-[#666666] border border-[#E2E2DF] hover:bg-[#F8F8F6]"
          }`}
        >
          <Target size={15} />
          <span>Live Spin Director</span>
          {spinControl?.next_prize ? (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          ) : (
            <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-black">
              DIRECT
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("slices")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === "slices"
              ? "bg-[#7A2E2E] text-white shadow-sm"
              : "bg-white text-[#666666] border border-[#E2E2DF] hover:bg-[#F8F8F6]"
          }`}
        >
          <Gift size={15} />
          <span>Wheel Slices &amp; Photos ({rewards.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("codes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === "codes"
              ? "bg-[#7A2E2E] text-white shadow-sm"
              : "bg-white text-[#666666] border border-[#E2E2DF] hover:bg-[#F8F8F6]"
          }`}
        >
          <Key size={15} />
          <span>Master Card List ({codes.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: LIVE SPIN DIRECTOR & TARGET WINNER */}
      {activeSubTab === "director" && (
        <div className="space-y-8 pt-2">
          {/* 1. Mode Status & Toggle */}
          <div className="border border-[#E2E2DF] rounded-2xl p-5 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                spinControl?.require_code ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
              }`}>
                {spinControl?.require_code ? <Key size={22} /> : <Zap size={22} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    spinControl?.require_code ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  }`}>
                    {spinControl?.require_code ? "Scratch Card Code Protected" : "Direct 1-Click Spin Active"}
                  </span>
                  <span className="text-[11px] text-[#888888]">• Current Queue: Spin #{currentSpinIndex + 1}</span>
                </div>
                <p className="text-xs text-[#555555] mt-1 font-medium">
                  {spinControl?.require_code
                    ? "Customers must enter their card secret code (MR-XXXXX) to trigger the wheel."
                    : "Customers directly click the wheel on the website to spin — no code typing required!"}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleToggleRequireCode(!spinControl?.require_code)}
              className="px-4 py-2.5 rounded-xl border border-[#D5D5D0] hover:bg-[#F8F8F6] text-xs font-bold uppercase tracking-wider text-[#222222] transition-colors whitespace-nowrap self-start md:self-auto cursor-pointer"
            >
              {spinControl?.require_code ? "Switch To Direct Spin" : "Switch To Code Mode"}
            </button>
          </div>

          {/* 2. Instant Winner Targeter (Direct Outcome for Next Spin) */}
          <div className="border-2 border-amber-400/60 rounded-3xl p-6 bg-gradient-to-br from-amber-500/5 via-white to-amber-500/10 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-amber-200/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Target size={18} className="text-[#7A2E2E]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#222222]">
                    1-Click Target Next Spin Winner
                  </h3>
                </div>
                <p className="text-xs text-[#666666] mt-0.5">
                  Select any product below to guarantee the very next customer spin lands on it!
                </p>
              </div>

              {spinControl?.next_prize && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSetNextPrize(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-[11px] font-bold uppercase transition-colors self-start md:self-auto"
                >
                  Clear Override &amp; Use Sequence
                </button>
              )}
            </div>

            {/* Current Target Status Callout */}
            <div className={`p-4 rounded-2xl flex items-center justify-between gap-4 ${
              spinControl?.next_prize
                ? "bg-amber-500/15 border-2 border-amber-400 text-amber-950"
                : "bg-emerald-500/10 border border-emerald-300 text-emerald-950"
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {spinControl?.next_prize ? "🎯" : "🔄"}
                </span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider block opacity-75">
                    {spinControl?.next_prize ? "Forced Winner Locked In" : "Following Scheduled Sequence"}
                  </span>
                  <div className="text-base font-extrabold flex items-center gap-2">
                    <span>Next Spin Result:</span>
                    <span className="underline decoration-2 text-[#7A2E2E]">
                      {spinControl?.next_prize || nextScheduledPrize}
                    </span>
                    {!spinControl?.next_prize && (
                      <span className="text-xs font-normal text-slate-500">
                        (Queue Step #{currentSpinIndex + 1})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-white/80 rounded-full shadow-xs">
                {spinControl?.next_prize ? "Override Active" : "Ready For Spin"}
              </span>
            </div>

            {/* Quick 1-Click Buttons Grid */}
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase text-[#666666] tracking-wider block mb-2">
                Click any product below to set as the next winner:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {rewards.filter((r) => r.enabled).map((r) => {
                  const isSelected = spinControl?.next_prize === r.reward_name;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      disabled={saving}
                      onClick={() => handleSetNextPrize(isSelected ? null : r.reward_name)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? "bg-[#7A2E2E] text-white border-[#7A2E2E] shadow-md scale-105 ring-2 ring-amber-400"
                          : "bg-white border-[#E2E2DF] hover:border-[#7A2E2E] hover:shadow-sm"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-0.5 flex items-center justify-center overflow-hidden">
                        {r.image_url ? (
                          <img
                            src={r.image_url}
                            alt={r.reward_name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Gift size={20} className={isSelected ? "text-white" : "text-[#7A2E2E]"} />
                        )}
                      </div>
                      <span className="text-xs font-bold truncate max-w-full block leading-tight">
                        {r.reward_name}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isSelected ? "bg-amber-400 text-slate-950" : "bg-slate-100 text-slate-700"
                      }`}>
                        {isSelected ? "Selected ✓" : "Set Winner"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Spin Sequence Queue (1st, 2nd, 3rd, 4th...) */}
          <div className="border border-[#E2E2DF] rounded-2xl p-6 bg-white shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E2E2DF] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <ListOrdered size={18} className="text-[#8A6A44]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222]">
                    Planned Spin Queue (Auto-Order Delivery)
                  </h3>
                </div>
                <p className="text-[11px] text-[#666666] mt-0.5">
                  1st customer gets #1, 2nd customer gets #2, 3rd gets #3. You can change any step using the dropdowns.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleResetSpinCounter(0)}
                  className="px-3 py-1.5 border border-[#D5D5D0] hover:bg-[#F8F8F6] text-[11px] font-bold uppercase rounded-lg transition-colors cursor-pointer"
                  title="Start over from Spin #1"
                >
                  Reset to Spin #1
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleResetSequence}
                  className="px-3 py-1.5 border border-[#8A6A44] text-[#8A6A44] hover:bg-[#8A6A44] hover:text-white text-[11px] font-bold uppercase rounded-lg transition-colors cursor-pointer"
                  title="Restore preassigned 101 sequence"
                >
                  Restore 101 Order
                </button>
              </div>
            </div>

            {/* Upcoming Sequence Cards List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 max-h-[460px] overflow-y-auto p-1">
              {currentSequence.slice(0, 30).map((prize, idx) => {
                const isCurrent = idx === currentSpinIndex;
                const isPast = idx < currentSpinIndex;
                return (
                  <div
                    key={`seq-${idx}`}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrent
                        ? "bg-amber-500/10 border-amber-400 shadow-sm ring-1 ring-amber-400"
                        : isPast
                        ? "bg-slate-50 border-slate-200 opacity-60"
                        : "bg-white border-[#E2E2DF] hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase text-[#888888]">
                        Spin #{idx + 1}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 animate-pulse">
                          Next Up ⚡
                        </span>
                      )}
                      {isPast && (
                        <span className="text-[9px] font-semibold text-slate-400">
                          Spun ✓
                        </span>
                      )}
                    </div>

                    <select
                      value={prize}
                      onChange={(e) => handleUpdateSequenceItem(idx, e.target.value)}
                      className="w-full text-xs font-bold bg-white border border-[#D5D5D0] rounded-lg p-2 text-[#222222] focus:outline-none focus:border-[#7A2E2E]"
                    >
                      {rewards.filter((r) => r.enabled).map((r) => (
                        <option key={r.id} value={r.reward_name}>
                          {r.reward_name}
                        </option>
                      ))}
                    </select>

                    <div className="flex justify-end mt-2">
                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => handleResetSpinCounter(idx)}
                          className="text-[9px] text-[#7A2E2E] hover:underline font-bold uppercase cursor-pointer"
                        >
                          Make Next
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Live Completed Direct Spins Log */}
          {spinControl?.history && spinControl.history.length > 0 && (
            <div className="border border-[#E2E2DF] rounded-2xl p-6 bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E2DF] pb-3">
                <div className="flex items-center gap-2">
                  <History size={16} className="text-[#7A2E2E]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222]">
                    Recent Spins Live Log ({spinControl.history.length})
                  </h3>
                </div>
                <span className="text-[10px] text-[#888888] uppercase tracking-wider">
                  Real-time Customer Spins
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F8F6] border-b border-[#E2E2DF] text-[#666666] uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-3">Spin #</th>
                      <th className="p-3">Prize Won</th>
                      <th className="p-3">Winner Details</th>
                      <th className="p-3">Date &amp; Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E2DF]">
                    {spinControl.history.slice(0, 10).map((h) => (
                      <tr key={h.id} className="hover:bg-[#F8F8F6]/60 transition-colors">
                        <td className="p-3 font-mono font-bold text-[#7A2E2E]">
                          #{h.spin_number}
                        </td>
                        <td className="p-3 font-bold text-[#222222]">
                          {h.prize}
                        </td>
                        <td className="p-3 text-[#666666]">
                          {h.winner_name || h.winner_phone ? (
                            <span>
                              {h.winner_name} {h.winner_phone ? `(${h.winner_phone})` : ""}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Direct counter spin</span>
                          )}
                        </td>
                        <td className="p-3 text-[11px] text-slate-500">
                          {new Date(h.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: WHEEL SLICES & PHOTOS */}
      {activeSubTab === "slices" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        {/* Add/Edit Reward Form */}
        <div className="lg:col-span-5 border border-[#E2E2DF] p-6 rounded-2xl bg-[#F8F8F6]">
          <div className="flex items-center gap-2 mb-4">
            <Gift size={16} className="text-[#7A2E2E]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222]">
              {editingRewardId ? "Edit Reward Slice" : "Add New Reward Slice"}
            </h3>
          </div>

          <form onSubmit={handleSaveReward} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#666666] tracking-wider mb-1">
                Product Name on Wheel *
              </label>
              <input
                type="text"
                value={rewardName}
                onChange={(e) => setRewardName(e.target.value)}
                placeholder="e.g. Smart LED TV, Wireless Earbuds, Brand Cup"
                required
                className="w-full bg-white border border-[#D5D5D0] px-3.5 py-2.5 rounded-xl text-sm text-[#222222] focus:outline-none focus:border-[#7A2E2E] shadow-xs"
              />
              <span className="text-[10px] text-[#888888] mt-1 block">
                Editing this name updates the wheel slice and winning scratch cards automatically.
              </span>
            </div>

            {/* Product Photo Option */}
            <div className="space-y-2 pt-1 border-t border-[#EAEAE6]">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold uppercase text-[#666666] tracking-wider">
                  Product Photo (On Wheel Slice)
                </label>
                {rewardImageUrl && (
                  <button
                    type="button"
                    onClick={() => setRewardImageUrl("")}
                    className="text-[10px] text-red-600 hover:text-red-800 font-bold uppercase"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              {rewardImageUrl && (
                <div className="flex items-center gap-3 p-2.5 bg-white border border-slate-200 rounded-xl">
                  <img
                    src={rewardImageUrl}
                    alt="Preview"
                    className="w-12 h-12 rounded-lg object-contain bg-slate-50 border border-slate-200 p-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      Photo Ready
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {rewardImageUrl}
                    </p>
                  </div>
                </div>
              )}

              <ImageUploader
                value={rewardImageUrl}
                onChange={(val) => setRewardImageUrl(val)}
                label="Upload Photo from Device"
                aspectHint="square"
              />

              <div className="pt-1">
                <input
                  type="url"
                  value={rewardImageUrl}
                  onChange={(e) => setRewardImageUrl(e.target.value)}
                  placeholder="Or paste direct image URL (https://...)"
                  className="w-full bg-white border border-[#D5D5D0] px-3 py-2 rounded-lg text-xs text-[#222222] focus:outline-none focus:border-[#7A2E2E]"
                />
              </div>
            </div>

            <div className="pt-1 border-t border-[#EAEAE6]">
              <label className="block text-[10px] font-bold uppercase text-[#666666] tracking-wider mb-1">
                Reward Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRewardType("random")}
                  className={`py-2 px-3 text-xs font-bold uppercase rounded-xl border transition-colors cursor-pointer ${
                    rewardType === "random"
                      ? "bg-[#7A2E2E] text-white border-[#7A2E2E]"
                      : "bg-white text-[#666666] border-[#D5D5D0]"
                  }`}
                >
                  Random Slice
                </button>
                <button
                  type="button"
                  onClick={() => setRewardType("milestone")}
                  className={`py-2 px-3 text-xs font-bold uppercase rounded-xl border transition-colors cursor-pointer ${
                    rewardType === "milestone"
                      ? "bg-[#8A6A44] text-white border-[#8A6A44]"
                      : "bg-white text-[#666666] border-[#D5D5D0]"
                  }`}
                >
                  Milestone Hit
                </button>
              </div>
            </div>

            {rewardType === "milestone" && (
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#666666] tracking-wider mb-1">
                  Milestone Trigger Spin Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={rewardMilestone}
                  onChange={(e) => setRewardMilestone(e.target.value)}
                  placeholder="e.g. 10 (awards on every 10th spin)"
                  required
                  className="w-full bg-white border border-[#D5D5D0] px-3 py-2 rounded-xl text-sm text-[#222222] focus:outline-none focus:border-[#7A2E2E]"
                />
                <span className="text-[10px] text-[#888888] mt-1 block">
                  Example: 101 for TV, 30 for Special Gift, etc.
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="rewardEnabledCheck"
                checked={rewardEnabled}
                onChange={(e) => setRewardEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-[#7A2E2E]"
              />
              <label htmlFor="rewardEnabledCheck" className="text-xs font-semibold text-[#444444] cursor-pointer">
                Slice Enabled on Wheel
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-[#7A2E2E] hover:bg-[#5F2222] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                {saving ? "Saving…" : editingRewardId ? "Update Reward & Photo" : "Add Reward Slice"}
              </button>
              {editingRewardId && (
                <button
                  type="button"
                  onClick={resetRewardForm}
                  className="px-4 py-3 border border-[#D5D5D0] text-[#666666] hover:bg-white text-xs font-bold uppercase rounded-xl"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Rewards Table List */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222]">
              Current Wheel Slices ({rewards.length})
            </h3>
            <span className="text-[10px] text-[#888888] uppercase tracking-wider">
              {rewards.filter((r) => r.enabled).length} Enabled
            </span>
          </div>

          <div className="border border-[#E2E2DF] overflow-hidden rounded-2xl bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F8F6] border-b border-[#E2E2DF] text-[#222222] uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3 w-14">Photo</th>
                  <th className="p-3">Product / Prize Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E2DF]">
                {rewards.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-xs text-[#888888] italic">
                      No rewards configured yet. Add your first slice on the left.
                    </td>
                  </tr>
                ) : (
                  rewards.map((r) => (
                    <tr key={r.id} className="hover:bg-[#F8F8F6]/60 transition-colors">
                      <td className="p-3">
                        {r.image_url ? (
                          <img
                            src={r.image_url}
                            alt={r.reward_name}
                            className="w-10 h-10 rounded-xl object-contain bg-slate-50 border border-slate-200 p-0.5 shadow-xs"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                            <ImageIcon size={16} />
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-bold text-[#222222]">
                        <div>{r.reward_name}</div>
                        {!r.image_url && (
                          <span className="text-[9px] text-amber-600 block mt-0.5">Click edit to add photo</span>
                        )}
                      </td>
                      <td className="p-3">
                        {r.type === "milestone" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-200">
                            Milestone (#{r.milestone || "any"})
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-200">
                            Random
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            r.enabled
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {r.enabled ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="p-3 text-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleEditReward(r)}
                          className="p-1.5 text-[#666666] hover:text-[#7A2E2E] transition-colors rounded-lg hover:bg-slate-100"
                          title="Edit Reward & Photo"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReward(r.id)}
                          className="p-1.5 text-[#666666] hover:text-red-700 transition-colors rounded-lg hover:bg-slate-100"
                          title="Delete Reward"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* SUB-TAB 3: MASTER CARD LIST & ACCESS CODES */}
      {activeSubTab === "codes" && (
        <div className="pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Key size={16} className="text-[#8A6A44]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222]">
                101 Master Card List ({codes.length})
              </h3>
            </div>
            <p className="text-[11px] text-[#666666]">
              Keep these physical cards in order (1 to 101). Customers enter the secret code on their card to win the pre-assigned prize.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Card # or Code..."
                className="pl-9 pr-3 py-2 text-xs border border-[#D5D5D0] rounded bg-white w-48 focus:outline-none focus:border-[#7A2E2E]"
              />
            </div>

            {/* Print Master Sheet */}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#8A6A44] text-[#8A6A44] hover:bg-[#8A6A44] hover:text-white text-xs font-bold uppercase tracking-wider rounded transition-colors"
            >
              <Printer size={13} />
              Print Cheat Sheet
            </button>
          </div>
        </div>

        {/* Codes Table */}
        <div className="border border-[#E2E2DF] overflow-x-auto rounded-xl bg-white shadow-xs max-h-[500px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F8F6] border-b border-[#E2E2DF] text-[#222222] uppercase tracking-wider font-bold sticky top-0 z-10">
              <tr>
                <th className="p-3 text-center w-20">Card #</th>
                <th className="p-3">Customer Code</th>
                <th className="p-3">Pre-Assigned Prize</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3">Redeemed At</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E2DF]">
              {codes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-xs text-[#888888] italic">
                    Loading codes…
                  </td>
                </tr>
              ) : (
                codes
                  .filter((c) => {
                    if (!searchTerm) return true;
                    const q = searchTerm.toLowerCase();
                    return (
                      (c.card_number && String(c.card_number).includes(q)) ||
                      c.code.toLowerCase().includes(q) ||
                      (c.prize && c.prize.toLowerCase().includes(q))
                    );
                  })
                  .map((c) => {
                    const prizeName = c.prize || "—";
                    const isTV = prizeName.toLowerCase() === "tv";
                    const isMilestone = ["tv", "special gift", "bt speaker", "headphone", "earbuds"].includes(prizeName.toLowerCase());

                    return (
                      <tr
                        key={c.id || c.code}
                        className={`hover:bg-[#F8F8F6]/60 transition-colors ${
                          isTV ? "bg-amber-50/50" : ""
                        }`}
                      >
                        <td className="p-3 text-center font-bold text-[#8A6A44]">
                          #{c.card_number || "—"}
                        </td>
                        <td className="p-3 font-mono font-black text-sm text-[#222222] tracking-wider">
                          {c.code}
                        </td>
                        <td className="p-3 font-bold">
                          {isTV ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-200 text-amber-900 border border-amber-300 font-extrabold shadow-xs">
                              👑 TV (GRAND PRIZE)
                            </span>
                          ) : isMilestone ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-rose-100 text-[#7A2E2E] border border-rose-200 font-bold">
                              🎁 {prizeName}
                            </span>
                          ) : (
                            <span className="text-[#555555] font-medium">
                              {prizeName}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {c.used ? (
                            <span className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                              Claimed
                            </span>
                          ) : (
                            <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                              Available
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-[11px] text-[#666666]">
                          {c.used_at ? new Date(c.used_at).toLocaleString() : "—"}
                        </td>
                        <td className="p-3 text-center">
                          {c.used ? (
                            <button
                              type="button"
                              onClick={() => handleToggleCodeStatus(c.code, c.id, false)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-colors shadow-xs cursor-pointer"
                              title="Reset code so customer can spin again"
                            >
                              <RotateCcw size={11} />
                              Make Unclaimed
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleCodeStatus(c.code, c.id, true)}
                              className="text-[10px] text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                              title="Manually mark as claimed"
                            >
                              Mark Claimed
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}
