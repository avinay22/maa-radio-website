"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles, Gift, AlertCircle, CheckCircle2, ArrowRight, RotateCw,
  ShieldCheck, MessageSquare, Trophy, Smartphone, Zap
} from "lucide-react";
import WheelCanvas from "@/components/SpinWheel/WheelCanvas";
import ConfettiEffect from "@/components/SpinWheel/ConfettiEffect";

interface RewardItem {
  id: string;
  reward_name: string;
  image_url?: string | null;
  type: "random" | "milestone";
  milestone?: number | null;
}

export default function SpinWheelPage() {
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [code, setCode] = useState("");
  const [requireCode, setRequireCode] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [winningResult, setWinningResult] = useState<{
    prize: string;
    code: string;
  } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Fetch wheel public status & active rewards
  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch("/api/spin/status");
        const data = await res.json();
        setIsActive(Boolean(data.isActive));
        setRequireCode(Boolean(data.requireCode));
        if (data.requireCode) {
          setShowCodeInput(true);
        }
        if (Array.isArray(data.rewards) && data.rewards.length > 0) {
          setRewards(data.rewards);
        }
      } catch (err) {
        console.error("Failed to load spin wheel status", err);
      } finally {
        setLoading(false);
      }
    }
    loadStatus();
  }, []);

  const triggerSpin = async () => {
    if (isSpinning) return;

    const trimmedCode = code.trim().toUpperCase();
    if (requireCode && !trimmedCode) {
      setErrorMsg("Please enter your card spin code.");
      setShowCodeInput(true);
      return;
    }

    setErrorMsg("");
    setIsSpinning(true);
    setShowConfetti(false);

    try {
      const res = await fetch("/api/spin/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: trimmedCode || undefined,
          name: customerName.trim() || undefined,
          phone: customerPhone.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "Unable to spin.");
        setIsSpinning(false);
        return;
      }

      // Backend confirmed win! Calculate exact degrees to land on the winning slice
      const count = rewards.length || 1;
      const sliceAngle = 360 / count;
      const targetSlice = typeof data.sliceIndex === "number" ? data.sliceIndex : 0;
      const sliceCenter = targetSlice * sliceAngle + sliceAngle / 2;

      // 14 full revolutions (5040deg) + offset to align pointer at 12 o'clock for a thrilling suspenseful 11s spin
      const currentFullSpins = Math.floor(rotation / 360);
      const nextSpins = (currentFullSpins + 14) * 360;
      const finalAngle = nextSpins + (360 - sliceCenter);

      setRotation(finalAngle);

      // Wait for 11s animation to settle completely
      setTimeout(() => {
        setIsSpinning(false);
        setShowConfetti(true);
        setWinningResult({
          prize: data.prize || "Exciting Reward",
          code: trimmedCode || (data.spinNumber ? `SPIN #${data.spinNumber}` : "LUCKY-WIN"),
        });
      }, 11150);
    } catch (err: any) {
      setErrorMsg(err?.message || "Network error. Please try again.");
      setIsSpinning(false);
    }
  };

  const handleSpin = async (e: React.FormEvent) => {
    e.preventDefault();
    await triggerSpin();
  };

  // Find won reward details for modal
  const wonReward = winningResult
    ? rewards.find(
        (r) =>
          r.reward_name.trim().toLowerCase() === winningResult.prize.trim().toLowerCase() ||
          winningResult.prize.trim().toLowerCase().includes(r.reward_name.trim().toLowerCase())
      )
    : null;

  const claimNameText = customerName.trim() ? ` (Name: ${customerName.trim()})` : "";
  const claimPhoneText = customerPhone.trim() ? ` (Phone: ${customerPhone.trim()})` : "";
  const claimCodeText = winningResult?.code.startsWith("MR-")
    ? ` with card code ${winningResult.code}`
    : ` (${winningResult?.code})`;

  const whatsappClaimUrl = winningResult
    ? `https://wa.me/917002733658?text=${encodeURIComponent(
        `Hello Maa Radio Mart! I won the prize "${winningResult.prize}" on your Lucky Spin Wheel${claimNameText}${claimPhoneText}${claimCodeText}. Please verify and guide me to claim it!`
      )}`
    : "#";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
            Loading Lucky Wheel…
          </p>
        </div>
      </div>
    );
  }

  // If Admin has toggled OFF
  if (!isActive) {
    return (
      <div className="min-h-screen bg-slate-950 pt-32 pb-20 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 md:p-10 text-center shadow-2xl rounded-3xl">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center rounded-2xl mx-auto mb-6">
            <Gift size={28} />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight uppercase mb-2">
            Spin Wheel Paused
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            The Lucky Spin event is currently paused by store management. Please stay tuned or check back during our next celebration promotion!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
          >
            Browse Store Products <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-[#0B0F19] to-slate-950 text-slate-100 pt-28 pb-20 px-4 md:px-8 relative overflow-hidden">
      <ConfettiEffect active={showConfetti} />

      {/* Atmospheric Stage Lighting & Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/15 via-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto">
        {/* Header Banner */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-widest mb-3 rounded-full shadow-sm backdrop-blur-sm">
            <Sparkles size={12} className="text-amber-400 animate-pulse" />
            <span>Maa Radio Exclusive Customer Giveaway</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 tracking-tight mb-3">
            Grand Lucky Spin &amp; Win
          </h1>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
            {requireCode
              ? "Scratch your secret store card, enter your code below, and spin the flagship wheel to win genuine electronics!"
              : "Tap the wheel or click below to spin and win genuine smartphones, TVs, speakers, and premium electronics!"}
          </p>
        </div>

        {/* Main Grid: Wheel + Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/80 border border-slate-800/90 p-6 md:p-10 shadow-2xl rounded-3xl backdrop-blur-md">
          {/* Wheel Display */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center py-2">
            <WheelCanvas
              slices={rewards}
              rotation={rotation}
              isSpinning={isSpinning}
              durationSeconds={11}
              onSpinClick={triggerSpin}
            />
            <div className="flex items-center gap-3 mt-4 text-[11px] text-slate-400 font-medium tracking-wide">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck size={14} /> 100% Certified Genuine Rewards
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <Trophy size={14} /> Guaranteed Gifts on Every Turn
              </span>
            </div>
            {!isSpinning && (
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                Tip: Click anywhere on the wheel or the button to spin
              </p>
            )}
          </div>

          {/* Controls & Form */}
          <div className="lg:col-span-5 bg-slate-950/90 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-inner">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Gift size={18} />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  {requireCode ? "Unlock Your Reward" : "Instant Lucky Spin"}
                </h2>
                <span className="text-[10px] text-emerald-400 font-semibold block">
                  {requireCode
                    ? "Enter card code to unlock spin"
                    : "Direct 1-Click Spin Enabled"}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {requireCode
                ? "Enter the unique code printed on your customer scratch card (e.g. MR-XXXXX) to trigger the wheel."
                : "No code required! Simply tap below to spin the wheel and claim your assured store reward."}
            </p>

            <form onSubmit={handleSpin} className="space-y-3.5">
              {/* Optional customer info for direct spin */}
              {!requireCode && (
                <div className="grid grid-cols-2 gap-2 pb-1">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                      Your Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Rahul"
                      disabled={isSpinning}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                      Mobile No. (Optional)
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      disabled={isSpinning}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              {/* Code Input (Mandatory if requireCode is on, or optional toggle if customer has card) */}
              {(requireCode || showCodeInput) && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Scratch Card Code {requireCode ? "*" : "(Optional)"}
                    </label>
                    {!requireCode && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowCodeInput(false);
                          setCode("");
                        }}
                        className="text-[9px] text-slate-400 hover:text-slate-200"
                      >
                        Hide
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.toUpperCase());
                        setErrorMsg("");
                      }}
                      placeholder="e.g. MR-48291"
                      disabled={isSpinning}
                      required={requireCode}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono font-bold text-white tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all shadow-inner"
                    />
                    {code && !isSpinning && (
                      <button
                        type="button"
                        onClick={() => setCode("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Toggle to enter code if hidden in direct mode */}
              {!requireCode && !showCodeInput && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowCodeInput(true)}
                    className="text-[10px] text-amber-400/80 hover:text-amber-300 underline font-medium"
                  >
                    Have a promo card code? Enter here
                  </button>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="flex items-start gap-2 text-rose-300 bg-rose-950/50 border border-rose-800/60 p-3 rounded-xl text-xs font-medium animate-in fade-in">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Spin Button */}
              <button
                type="submit"
                disabled={isSpinning || (requireCode && !code.trim())}
                className={`w-full py-4 text-xs font-black uppercase tracking-widest text-slate-950 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer ${
                  isSpinning
                    ? "bg-amber-600 cursor-not-allowed opacity-90"
                    : "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 active:scale-[0.98] animate-pulse"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSpinning ? (
                  <>
                    <RotateCw size={16} className="animate-spin text-slate-950" />
                    <span>Spinning The Wheel…</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="text-slate-950" />
                    <span>SPIN THE WHEEL NOW!</span>
                  </>
                )}
              </button>
            </form>

            {/* Verification Note */}
            <div className="mt-6 pt-5 border-t border-slate-800 text-[11px] text-slate-500 leading-relaxed">
              <strong className="text-slate-300 block mb-1">
                Where do I get my spin card?
              </strong>
              Collect your complimentary lucky spin card with purchases at Maa Radio Mart in Gogamukh, Assam. Each card guarantees an exciting tech reward!
            </div>
          </div>
        </div>

        {/* Live Prizes Showcase Strip */}
        {rewards.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Available Wheel Prizes ({rewards.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Every slice carries an assured gift or electronics giveaway.
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                Assured Winning
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {rewards.map((r) => (
                <div
                  key={r.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col items-center text-center shadow-xs hover:border-slate-700 transition-all group"
                >
                  <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 p-1 mb-2 flex items-center justify-center overflow-hidden">
                    {r.image_url ? (
                      <img
                        src={r.image_url}
                        alt={r.reward_name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <Gift size={20} className="text-amber-400" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-200 line-clamp-1">
                    {r.reward_name}
                  </span>
                  <span className="text-[9px] text-slate-500 mt-1 uppercase font-semibold">
                    {r.type === "milestone" ? `Milestone #${r.milestone}` : "Lucky Draw"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Winning Result Celebratory Modal */}
      {winningResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border-2 border-amber-400/80 max-w-md w-full p-8 text-center shadow-2xl rounded-3xl relative animate-in zoom-in-95 duration-300">
            {/* Celebration Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-950 shadow-lg shadow-amber-500/30">
              <Sparkles size={32} />
            </div>

            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3.5 py-1 rounded-full">
              ★ WINNER CONGRATULATIONS ★
            </span>

            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-3 mb-1">
              You Just Won!
            </h3>

            {/* Prize Box with Image */}
            <div className="my-5 p-5 bg-slate-950/90 border border-slate-800 rounded-2xl flex flex-col items-center">
              {wonReward?.image_url && (
                <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-slate-800 p-2 mb-3 flex items-center justify-center shadow-inner">
                  <img
                    src={wonReward.image_url}
                    alt={winningResult.prize}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}

              <p className="text-[10px] uppercase text-slate-400 tracking-widest font-bold mb-1">
                Your Official Reward
              </p>
              <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 tracking-wide">
                {winningResult.prize}
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Redeemed via card: <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">{winningResult.code}</span>
              </p>
            </div>

            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Take a screenshot of this winning screen or tap the WhatsApp button below to instantly claim your reward with store owner Avinay Sharma!
            </p>

            <div className="flex flex-col gap-2.5">
              <a
                href={whatsappClaimUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer"
              >
                <MessageSquare size={16} />
                Claim Reward on WhatsApp
              </a>

              <button
                type="button"
                onClick={() => setWinningResult(null)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Close &amp; Keep Playing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
