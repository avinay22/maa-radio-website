"use client";

import React, { useMemo } from "react";

interface WheelSlice {
  id: string;
  reward_name: string;
  type?: string;
}

interface WheelCanvasProps {
  slices: WheelSlice[];
  rotation: number;
  isSpinning: boolean;
}

// Brand color palette matching Maa Radio's premium electronics retail aesthetic
const SLICE_COLORS = [
  "#7A2E2E", // Royal Maroon
  "#8A6A44", // Antique Gold
  "#222222", // Deep Charcoal
  "#9E3838", // Vivid Crimson
  "#B38E5D", // Warm Gold
  "#3A3A3A", // Slate Dark
  "#612222", // Dark Maroon
  "#C5A880", // Champagne Gold
];

export default function WheelCanvas({
  slices,
  rotation,
  isSpinning,
}: WheelCanvasProps) {
  const count = slices.length || 1;
  const sliceAngle = 360 / count;
  const radius = 180;
  const center = 200;

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

      const midAngle = (i * sliceAngle + sliceAngle / 2);
      const color = SLICE_COLORS[i % SLICE_COLORS.length];

      return {
        pathData,
        color,
        midAngle,
        text: slice.reward_name,
      };
    });
  }, [slices, sliceAngle, center, radius, count]);

  return (
    <div className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-square mx-auto flex items-center justify-center p-4">
      {/* Outer Glow & Metallic Ring */}
      <div className="absolute inset-2 rounded-full border-8 border-[#C5A880]/30 shadow-[0_0_50px_rgba(138,106,68,0.25)] pointer-events-none" />

      {/* Top Fixed Pointer Arrow (12 o'clock) */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
        <div className="w-6 h-8 bg-gradient-to-b from-[#8A6A44] via-[#F4E8D1] to-[#7A2E2E] shadow-xl clip-pointer [clip-path:polygon(50%_100%,0%_0%,100%_0%)]" />
        <div className="w-3 h-3 rounded-full bg-[#7A2E2E] border-2 border-white -mt-1 shadow-md" />
      </div>

      {/* Rotating Wheel Container */}
      <div
        className="w-full h-full relative"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning
            ? "transform 5s cubic-bezier(0.15, 0.9, 0.2, 1.0)"
            : "none",
        }}
      >
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full drop-shadow-2xl select-none"
        >
          <defs>
            <radialGradient id="hubGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F5E6CA" />
              <stop offset="60%" stopColor="#8A6A44" />
              <stop offset="100%" stopColor="#553A1B" />
            </radialGradient>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Outer Wheel Rim */}
          <circle
            cx={center}
            cy={center}
            r={radius + 12}
            fill="#1A1A1A"
            stroke="#8A6A44"
            strokeWidth="6"
          />

          {/* Decorative Rim Lights/Dots */}
          {Array.from({ length: 24 }).map((_, idx) => {
            const angle = (idx * (360 / 24) * Math.PI) / 180;
            const cx = center + (radius + 6) * Math.cos(angle);
            const cy = center + (radius + 6) * Math.sin(angle);
            return (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r="3"
                fill={idx % 2 === 0 ? "#F8F8F6" : "#8A6A44"}
              />
            );
          })}

          {/* Wheel Slices */}
          {slicePaths.map((slice, i) => (
            <g key={i}>
              <path
                d={slice.pathData}
                fill={slice.color}
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
              {/* Rotated Text along the slice radius */}
              <g
                transform={`rotate(${slice.midAngle}, ${center}, ${center})`}
              >
                <text
                  x={center}
                  y={center - radius * 0.62}
                  fill="#FFFFFF"
                  fontSize={count > 8 ? "10" : "12"}
                  fontWeight="bold"
                  textAnchor="middle"
                  transform={`rotate(90, ${center}, ${center - radius * 0.62})`}
                  className="font-sans tracking-wide drop-shadow-sm uppercase select-none pointer-events-none"
                >
                  {slice.text.length > 18
                    ? `${slice.text.substring(0, 16)}…`
                    : slice.text}
                </text>
              </g>
            </g>
          ))}

          {/* Central Golden Hub */}
          <circle
            cx={center}
            cy={center}
            r="38"
            fill="url(#hubGradient)"
            stroke="#FFFFFF"
            strokeWidth="3"
            filter="url(#shadow)"
          />
          <circle
            cx={center}
            cy={center}
            r="24"
            fill="#7A2E2E"
            stroke="#8A6A44"
            strokeWidth="2"
          />
          <text
            x={center}
            y={center + 4}
            fill="#FFFFFF"
            fontSize="10"
            fontWeight="900"
            textAnchor="middle"
            className="tracking-widest uppercase select-none pointer-events-none"
          >
            SPIN
          </text>
        </svg>
      </div>
    </div>
  );
}
