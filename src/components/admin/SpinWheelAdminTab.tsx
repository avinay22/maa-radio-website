"use client";

import React, { useState, useEffect } from "react";
import {
  RotateCw, Plus, Trash2, Edit2, CheckCircle, AlertCircle,
  ToggleLeft, ToggleRight, Sparkles, Gift, Key, Layers, Loader2, RefreshCw
} from "lucide-react";
import { SpinReward, SpinCode, SpinSettings, SpinStats } from "@/lib/spinTypes";

export default function SpinWheelAdminTab({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [settings, setSettings] = useState<SpinSettings>({ is_active: true });
  const [stats, setStats] = useState<SpinStats>({ total_spins: 0 });
  const [rewards, setRewards] = useState<SpinReward[]>([]);
  const [codes, setCodes] = useState<SpinCode[]>([]);

  // Reward Edit Form state
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [rewardName, setRewardName] = useState("");
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
      showNotification(`Spin Wheel is now ${nextState ? "ACTIVE (ON)" : "PAUSED (OFF)}"}`);
    } catch (err: any) {
      setErrorMsg(err?.message);
    } finally {
      setSaving(false);
    }
  };

  // 2. Save / Update Reward
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
      showNotification("Reward saved successfully!");
    } catch (err: any) {
      setErrorMsg(err?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditReward = (reward: SpinReward) => {
    setEditingRewardId(reward.id);
    setRewardName(reward.reward_name);
    setRewardType(reward.type);
    setRewardMilestone(reward.milestone ? String(reward.milestone) : "");
    setRewardEnabled(reward.enabled);
  };

  const resetRewardForm = () => {
    setEditingRewardId(null);
    setRewardName("");
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

      {/* SECTION 1: REWARDS CONFIGURATION */}
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
                Reward Label *
              </label>
              <input
                type="text"
                value={rewardName}
                onChange={(e) => setRewardName(e.target.value)}
                placeholder="e.g. Flat ₹150 OFF, Free Hair Serum"
                required
                className="w-full bg-white border border-[#D5D5D0] px-3 py-2 text-sm text-[#222222] focus:outline-none focus:border-[#7A2E2E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-[#666666] tracking-wider mb-1">
                Reward Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRewardType("random")}
                  className={`py-2 px-3 text-xs font-bold uppercase rounded border transition-colors cursor-pointer ${
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
                  className={`py-2 px-3 text-xs font-bold uppercase rounded border transition-colors cursor-pointer ${
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
                  className="w-full bg-white border border-[#D5D5D0] px-3 py-2 text-sm text-[#222222] focus:outline-none focus:border-[#7A2E2E]"
                />
                <span className="text-[10px] text-[#888888] mt-1 block">
                  Example: 10 = Given on spin #10, #20, #30 etc.
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
                className="flex-1 py-3 bg-[#7A2E2E] hover:bg-[#5F2222] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                {saving ? "Saving…" : editingRewardId ? "Update Reward" : "Add Reward"}
              </button>
              {editingRewardId && (
                <button
                  type="button"
                  onClick={resetRewardForm}
                  className="px-4 py-3 border border-[#D5D5D0] text-[#666666] hover:bg-white text-xs font-bold uppercase"
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

          <div className="border border-[#E2E2DF] overflow-hidden rounded-xl bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F8F6] border-b border-[#E2E2DF] text-[#222222] uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3">Reward Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E2DF]">
                {rewards.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-xs text-[#888888] italic">
                      No rewards configured yet. Add your first slice on the left.
                    </td>
                  </tr>
                ) : (
                  rewards.map((r) => (
                    <tr key={r.id} className="hover:bg-[#F8F8F6]/60 transition-colors">
                      <td className="p-3 font-bold text-[#222222]">
                        {r.reward_name}
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
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
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
                          className="p-1.5 text-[#666666] hover:text-[#7A2E2E] transition-colors"
                          title="Edit Reward"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReward(r.id)}
                          className="p-1.5 text-[#666666] hover:text-red-700 transition-colors"
                          title="Delete Reward"
                        >
                          <Trash2 size={13} />
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

      {/* SECTION 2: ACCESS CODES GENERATOR & LIST */}
      <div className="pt-8 border-t border-[#E2E2DF]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Key size={16} className="text-[#8A6A44]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#222222]">
                Customer Spin Codes ({codes.length})
              </h3>
            </div>
            <p className="text-[11px] text-[#666666]">
              Issue unique codes to customers to unlock a spin. One code = one guaranteed spin.
            </p>
          </div>

          {/* Quick Generator form */}
          <form onSubmit={handleGenerateCodes} className="flex items-center gap-2">
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
              placeholder="Custom Code (e.g. VIP2026)"
              className="bg-white border border-[#D5D5D0] px-3 py-2 text-xs font-mono font-bold text-[#222222] focus:outline-none focus:border-[#7A2E2E] w-48"
            />
            {!customCode && (
              <select
                value={codeCount}
                onChange={(e) => setCodeCount(parseInt(e.target.value, 10))}
                className="bg-white border border-[#D5D5D0] px-2 py-2 text-xs font-bold text-[#444444]"
              >
                <option value={1}>1 Code</option>
                <option value={5}>5 Random</option>
                <option value={10}>10 Random</option>
                <option value={20}>20 Random</option>
              </select>
            )}
            <button
              type="submit"
              disabled={generatingCode}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8A6A44] hover:bg-[#6D5233] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Plus size={13} />
              {generatingCode ? "Creating…" : "Generate"}
            </button>
          </form>
        </div>

        {/* Codes Table */}
        <div className="border border-[#E2E2DF] overflow-x-auto rounded-xl bg-white shadow-xs max-h-96">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F8F6] border-b border-[#E2E2DF] text-[#222222] uppercase tracking-wider font-bold sticky top-0">
              <tr>
                <th className="p-3">Spin Code</th>
                <th className="p-3">Status</th>
                <th className="p-3">Prize Won</th>
                <th className="p-3">Redeemed At</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E2DF]">
              {codes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-xs text-[#888888] italic">
                    No spin codes generated yet. Generate your first code above.
                  </td>
                </tr>
              ) : (
                codes.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8F8F6]/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-sm text-[#222222]">
                      {c.code}
                    </td>
                    <td className="p-3">
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
                    <td className="p-3 font-bold text-[#7A2E2E]">
                      {c.prize || "—"}
                    </td>
                    <td className="p-3 text-[11px] text-[#666666]">
                      {c.used_at ? new Date(c.used_at).toLocaleString() : "—"}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteCode(c.id)}
                        className="p-1 text-[#888888] hover:text-red-700 transition-colors"
                        title="Delete Code"
                      >
                        <Trash2 size={13} />
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
  );
}
