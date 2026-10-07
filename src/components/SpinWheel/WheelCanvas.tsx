"use client";

import React, { useMemo } from "react";

export interface WheelSlice {
  id: string;
  reward_name: string;
  image_url?: string | null;
  type?: string;
  milestone?: number | null;
}

interface WheelCanvasProps {
  slices: WheelSlice[];
  rotation: number;
  isSpinning: boolean;
  durationSeconds?: number;
  onSpinClick?: () => void;
}

// Jewel-tone palette for a luxury electronics giveaway wheel
const SLICE_COLORS = [
  "#881337", // Royal Ruby Crimson
  "#1E3A8A", // Deep Sapphire Blue
  "#78350F", // Burnished Gold Amber
  "#065F46", // Imperial Emerald Green
  "#581C87", // Regal Amethyst
  "#0F766E", // Deep Peacock Teal
  "#1E293B", // Midnight Slate
  "#9F1239", // Vivid Crimson Rose
];

export default function WheelCanvas({
  slices,
  rotation,
  isSpinning,
  durationSeconds = 20,
  onSpinClick,
}: WheelCanvasProps) {
  const count = slices.length || 1;
  const sliceAngle = 360 / count;
  const viewBoxSize = 460;
  const center = viewBoxSize / 2; // 230
  const radius = 195; // Radius of pie slices

  // Generate SVG path for a circular pie slice
  const slicePaths = useMemo(() => {
    return slices.map((slice, i) => {
      const startAngle = (i * sliceAngle - 90) * (Math.PI / 180);
      const endAngle = ((i + 1) * sliceAngle - 90) * (Math.PI / 180);

      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);
      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);

      const largeArcFlag = sliceAngle > 180 ? 1 : 0;
      const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      const midAngle = i * sliceAngle + sliceAngle / 2;
      const color = SLICE_COLORS[i % SLICE_COLORS.length];

      // Format text: split into two lines if multi-word or long
      const words = slice.reward_name.trim().split(/\s+/);
      let line1 = slice.reward_name;
      let line2 = "";

      if (words.length >= 2) {
        line1 = words[0];
        line2 = words.slice(1).join(" ");
      } else if (slice.reward_name.length > 9) {
        line1 = slice.reward_name.substring(0, 8);
        line2 = slice.reward_name.substring(8);
      }

      return {
        id: slice.id || `slice-${i}`,
        pathData,
        color,
        midAngle,
        text: slice.reward_name,
        line1,
        line2,
        imageUrl: slice.image_url || "",
      };
    });
  }, [slices, sliceAngle, center, radius, count]);

  return (
    <div className="relative w-full max-w-[390px] sm:max-w-[450px] aspect-square mx-auto flex items-center justify-center p-3 select-none">
      {/* Outer Glow Halo */}
      <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-amber-500/20 via-rose-500/15 to-amber-500/20 blur-xl pointer-events-none" />

      {/* Outer Metallic Gold Trim Ring */}
      <div className="absolute inset-2 rounded-full border-4 border-[#F59E0B]/40 shadow-[0_0_35px_rgba(245,158,11,0.25)] pointer-events-none" />

      {/* Top Fixed Pointer (12 o'clock) with 3D drop shadow */}
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
        {/* Golden Arrowhead Needle */}
        <div className="w-8 h-10 bg-gradient-to-b from-[#FDE68A] via-[#F59E0B] to-[#991B1B] shadow-[0_8px_16px_rgba(0,0,0,0.5)] [clip-path:polygon(50%_100%,0%_0%,100%_0%)] filter drop-shadow-md" />
        {/* Ruby Jewel Cap */}
        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-rose-500 to-red-950 border-2 border-amber-300 -mt-1.5 shadow-md flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
        </div>
      </div>

      {/* Rotating Wheel Container */}
      <div
        onClick={() => {
          if (!isSpinning && onSpinClick) {
            onSpinClick();
          }
        }}
        className={`w-full h-full relative ${onSpinClick && !isSpinning ? "cursor-pointer active:scale-[0.99] transition-transform" : ""}`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning
            ? `transform ${durationSeconds}s cubic-bezier(0.15, 0.85, 0.2, 1.0)`
            : "none",
        }}
      >
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="w-full h-full drop-shadow-2xl overflow-visible"
        >
          <defs>
            {/* Center Gold Radial Gradient */}
            <radialGradient id="goldHubGrad" cx="45%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="35%" stopColor="#FDE68A" />
              <stop offset="65%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </radialGradient>

            {/* Bezel Ring Gradient */}
            <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2A1B0E" />
              <stop offset="50%" stopColor="#111827" />
              <stop offset="100%" stopColor="#3E2713" />
            </linearGradient>

            {/* General Drop Shadow Filter */}
            <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.45" />
            </filter>

            {/* Text Glow Shadow */}
            <filter id="wheelTextShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.8" />
            </filter>

            {/* Circular ClipPaths for slice images */}
            {slicePaths.map((slice, i) => (
              <clipPath key={`clip-${i}`} id={`slice-badge-clip-${i}`}>
                <circle cx={center} cy="86" r="20" />
              </clipPath>
            ))}
          </defs>

          {/* Outer Wheel Rim / Frame */}
          <circle
            cx={center}
            cy={center}
            r={radius + 18}
            fill="url(#bezelGrad)"
            stroke="#F59E0B"
            strokeWidth="5"
          />
          <circle
            cx={center}
            cy={center}
            r={radius + 6}
            fill="none"
            stroke="#D97706"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.6"
          />

          {/* Decorative Cabochon LED Lights around rim */}
          {Array.from({ length: 32 }).map((_, idx) => {
            const angle = (idx * (360 / 32) * Math.PI) / 180;
            const cx = center + (radius + 10) * Math.cos(angle);
            const cy = center + (radius + 10) * Math.sin(angle);
            const isGold = idx % 2 === 0;

            return (
              <g key={`light-${idx}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="3.5"
                  fill={isGold ? "#FDE68A" : "#FFFFFF"}
                  stroke={isGold ? "#B45309" : "#9CA3AF"}
                  strokeWidth="0.8"
                />
                {/* Specular bulb gleam */}
                <circle
                  cx={cx - 1}
                  cy={cy - 1}
                  r="1"
                  fill="#FFFFFF"
                  opacity="0.9"
                />
              </g>
            );
          })}

          {/* Wheel Slices */}
          {slicePaths.map((slice, i) => (
            <g key={`slice-${i}`}>
              {/* Pie Wedge Path */}
              <path
                d={slice.pathData}
                fill={slice.color}
                stroke="#FFFFFF"
                strokeWidth="1.8"
              />

              {/* Rotated Group: Oriented outward along the slice's central radius */}
              <g transform={`rotate(${slice.midAngle}, ${center}, ${center})`}>
                
                {/* 1. PRODUCT PHOTO BADGE (Medallion near rim at y=86) */}
                <g filter="url(#badgeShadow)">
                  {/* Outer Gold Ring */}
                  <circle
                    cx={center}
                    cy="86"
                    r="22.5"
                    fill="#FFFFFF"
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                  />

                  {/* Inner Crisp Product Image */}
                  {slice.imageUrl ? (
                    <image
                      href={slice.imageUrl}
                      x={center - 20}
                      y={66}
                      width="40"
                      height="40"
                      preserveAspectRatio="xMidYMid slice"
                      clipPath={`url(#slice-badge-clip-${i})`}
                    />
                  ) : (
                    /* Fallback Icon Badge if no image uploaded yet */
                    <g transform={`translate(${center - 12}, 74)`}>
                      <rect
                        width="24"
                        height="24"
                        rx="4"
                        fill="#FEF3C7"
                      />
                      <circle cx="12" cy="12" r="6" fill="#D97706" />
                    </g>
                  )}

                  {/* Subtle glass gloss highlight over image */}
                  <ellipse
                    cx={center}
                    cy="75"
                    rx="14"
                    ry="6"
                    fill="#FFFFFF"
                    opacity="0.25"
                    pointerEvents="none"
                  />
                </g>

                {/* 2. PRODUCT NAME TEXT (Positioned horizontally below photo) */}
                <g filter="url(#wheelTextShadow)">
                  {slice.line2 ? (
                    <text
                      x={center}
                      y="132"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontWeight="900"
                      textAnchor="middle"
                      className="font-sans uppercase tracking-wider select-none pointer-events-none"
                    >
                      <tspan x={center} dy="0">
                        {slice.line1.length > 10 ? `${slice.line1.substring(0, 9)}.` : slice.line1}
                      </tspan>
                      <tspan x={center} dy="12" fontSize="9.5" fill="#FEF08A">
                        {slice.line2.length > 10 ? `${slice.line2.substring(0, 9)}.` : slice.line2}
                      </tspan>
                    </text>
                  ) : (
                    <text
                      x={center}
                      y="136"
                      fill="#FFFFFF"
                      fontSize="10.5"
                      fontWeight="900"
                      textAnchor="middle"
                      className="font-sans uppercase tracking-wider select-none pointer-events-none"
                    >
                      {slice.line1.length > 13 ? `${slice.line1.substring(0, 11)}..` : slice.line1}
                    </text>
                  )}
                </g>
              </g>
            </g>
          ))}

          {/* Central Multi-Tier Golden Hub */}
          {/* Outer Bevel */}
          <circle
            cx={center}
            cy={center}
            r="44"
            fill="url(#goldHubGrad)"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            filter="url(#badgeShadow)"
          />
          {/* Inner Accent Ring */}
          <circle
            cx={center}
            cy={center}
            r="32"
            fill="#78350F"
            stroke="#FDE68A"
            strokeWidth="2"
          />
          {/* Ruby Core */}
          <circle
            cx={center}
            cy={center}
            r="26"
            fill="#881337"
            stroke="#D97706"
            strokeWidth="2"
          />
          {/* Center Text / Brand Star */}
          <text
            x={center}
            y={center - 3}
            fill="#FDE68A"
            fontSize="10"
            fontWeight="900"
            textAnchor="middle"
            className="tracking-widest uppercase select-none pointer-events-none font-sans"
          >
            MAA
          </text>
          <text
            x={center}
            y={center + 8}
            fill="#FFFFFF"
            fontSize="8"
            fontWeight="800"
            textAnchor="middle"
            className="tracking-widest uppercase select-none pointer-events-none font-sans"
          >
            SPIN
          </text>
        </svg>
      </div>
    </div>
  );
}
