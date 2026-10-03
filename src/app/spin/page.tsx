"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Gift, AlertCircle, CheckCircle2, ArrowRight, RotateCw, Volume2, ShieldCheck } from "lucide-react";
import WheelCanvas from "@/components/SpinWheel/WheelCanvas";
import ConfettiEffect from "@/components/SpinWheel/ConfettiEffect";

interface RewardItem {
  id: string;
  reward_name: string;
  type: "random" | "milestone";
}

export default function SpinWheelPage() {
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [code, setCode] = useState("");
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

  const handleSpin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSpinning) return;

    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      setErrorMsg("Please enter your spin code.");
      return;
    }

    setErrorMsg("");
    setIsSpinning(true);
    setShowConfetti(false);

    try {
      const res = await fetch("/api/spin/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmedCode }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "Unable to spin with this code.");
        setIsSpinning(false);
        return;
      }

      // Backend confirmed win! Calculate exact degrees to land on the winning slice
      const count = rewards.length || 1;
      const sliceAngle = 360 / count;
      const targetSlice = typeof data.sliceIndex === "number" ? data.sliceIndex : 0;
      const sliceCenter = targetSlice * sliceAngle + sliceAngle / 2;

      // 5 full spins (1800deg) + offset to align pointer at 12 o'clock
      const currentFullSpins = Math.floor(rotation / 360);
      const nextSpins = (currentFullSpins + 6) * 360;
      const finalAngle = nextSpins + (360 - sliceCenter);

      setRotation(finalAngle);

      // Wait for 5s animation to complete
      setTimeout(() => {
        setIsSpinning(false);
        setShowConfetti(true);
        setWinningResult({
          prize: data.prize || "Exciting Reward",
          code: trimmedCode,
        });
      }, 5100);
    } catch (err: any) {
      setErrorMsg(err?.message || "Network error. Please try again.");
      setIsSpinning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#7A2E2E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold uppercase tracking-wider text-[#666666]">
            Loading Lucky Wheel…
          </p>
        </div>
      </div>
    );
  }

  // If Admin has toggled OFF
  if (!isActive) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] pt-32 pb-20 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-[#E2E2DF] p-8 md:p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#7A2E2E]/10 border border-[#7A2E2E]/20 text-[#7A2E2E] flex items-center justify-center rounded-full mx-auto mb-6">
            <Gift size={28} />
          </div>
          <h1 className="text-xl font-extrabold text-[#222222] tracking-tight uppercase mb-2">
            Spin Wheel Paused
          </h1>
          <p className="text-xs text-[#666666] leading-relaxed mb-6">
            The Lucky Spin event is currently paused by store management. Please stay tuned or check back during our next festival promotion!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#7A2E2E] hover:bg-[#5F2222] text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Browse Products <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFC] pt-28 pb-20 px-4 md:px-8">
      <ConfettiEffect active={showConfetti} />

      <div className="max-w-6xl mx-auto">
        {/* Header Banner */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8A6A44]/10 border border-[#8A6A44]/20 text-[#8A6A44] text-[10px] font-bold uppercase tracking-widest mb-3 rounded-full">
            <Sparkles size={12} />
            Exclusive Customer Giveaway
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#222222] tracking-tight mb-3">
            Lucky Spin & Win
          </h1>
          <p className="text-xs md:text-sm text-[#666666] leading-relaxed">
            Enter your secret spin access code below, spin the luxury wheel, and unlock assured rewards, discounts, and gift items.
          </p>
        </div>

        {/* Main Grid: Wheel + Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-[#E2E2DF] p-6 md:p-12 shadow-sm rounded-2xl">
          {/* Wheel Display */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center py-4">
            <WheelCanvas
              slices={rewards}
              rotation={rotation}
              isSpinning={isSpinning}
            />
            <p className="text-[11px] text-[#888888] font-medium tracking-wide mt-4 uppercase flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#8A6A44]" />
              Fair & Verified Randomized Rewards
            </p>
          </div>

          {/* Controls & Form */}
          <div className="lg:col-span-5 bg-[#F8F8F6] border border-[#E2E2DF] p-6 md:p-8 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Gift size={18} className="text-[#7A2E2E]" />
              <h2 className="text-base font-bold text-[#222222] uppercase tracking-wider">
                Claim Your Spin
              </h2>
            </div>

            <p className="text-xs text-[#666666] mb-6 leading-relaxed">
              Received a coupon code from our store or invoice? Enter it below. Each unique code is valid for one spin.
            </p>

            <form onSubmit={handleSpin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#666666] tracking-wider mb-1.5">
                  Enter Spin Code *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setErrorMsg("");
                    }}
                    placeholder="e.g. MAA100"
                    disabled={isSpinning}
                    required
                    className="w-full bg-white border border-[#D5D5D0] px-4 py-3.5 text-base font-mono font-bold text-[#222222] tracking-widest placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#7A2E2E] transition-colors"
                  />
                  {code && !isSpinning && (
                    <button
                      type="button"
                      onClick={() => setCode("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#999999] hover:text-[#222222]"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="flex items-start gap-2 text-[#7A2E2E] bg-[#7A2E2E]/10 border border-[#7A2E2E]/30 p-3 rounded text-xs font-semibold">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Spin Button */}
              <button
                type="submit"
                disabled={isSpinning || !code.trim()}
                className={`w-full py-4 text-xs font-bold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                  isSpinning
                    ? "bg-[#8A6A44] cursor-not-allowed opacity-90"
                    : "bg-[#7A2E2E] hover:bg-[#5F2222] active:scale-[0.99]"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSpinning ? (
                  <>
                    <RotateCw size={15} className="animate-spin" />
                    Spinning The Wheel…
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    SPIN NOW
                  </>
                )}
              </button>
            </form>

            {/* Test Helper Tip */}
            <div className="mt-6 pt-5 border-t border-[#E2E2DF] text-[11px] text-[#777777]">
              <span className="font-bold text-[#222222] block mb-1">
                How to get spin codes?
              </span>
              Codes are issued to customers with salon appointments or product purchases. Test codes:{" "}
              <code className="bg-white border px-1.5 py-0.5 font-bold text-[#7A2E2E] rounded">
                MAA100
              </code>{" "}
              or{" "}
              <code className="bg-white border px-1.5 py-0.5 font-bold text-[#7A2E2E] rounded">
                LUCKY2026
              </code>
              .
            </div>
          </div>
        </div>
      </div>

      {/* Winning Result Modal */}
      {winningResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#8A6A44] max-w-md w-full p-8 text-center shadow-2xl rounded-2xl relative animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-[#8A6A44]/10 border border-[#8A6A44]/30 rounded-full flex items-center justify-center mx-auto mb-4 text-[#8A6A44]">
              <Sparkles size={32} />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A6A44] bg-[#8A6A44]/10 px-3 py-1 rounded-full">
              Congratulations!
            </span>

            <h3 className="text-2xl md:text-3xl font-extrabold text-[#222222] tracking-tight mt-3 mb-2">
              You Won!
            </h3>

            <div className="my-5 p-5 bg-[#F8F8F6] border border-[#E2E2DF] rounded-xl">
              <p className="text-xs uppercase text-[#666666] tracking-wider mb-1 font-bold">
                Your Prize
              </p>
              <p className="text-2xl font-black text-[#7A2E2E] tracking-wide">
                {winningResult.prize}
              </p>
              <p className="text-[10px] text-[#888888] mt-2">
                Redeemed via code: <span className="font-mono font-bold text-[#222222]">{winningResult.code}</span>
              </p>
            </div>

            <p className="text-xs text-[#666666] mb-6 leading-relaxed">
              Show this screen or quote your code to our team to claim your discount or reward on your next order!
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/products"
                className="flex-1 py-3 bg-[#7A2E2E] hover:bg-[#5F2222] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 rounded-lg"
              >
                Use On Products <ArrowRight size={14} />
              </Link>
              <button
                type="button"
                onClick={() => setWinningResult(null)}
                className="py-3 px-5 border border-[#D5D5D0] text-[#666666] hover:bg-[#F8F8F6] text-xs font-bold uppercase tracking-wider rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
