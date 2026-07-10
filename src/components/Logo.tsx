import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  light?: boolean;
}

export default function Logo({
  className = "",
  showText = true,
  size = "md",
  light = false,
}: LogoProps) {
  // Sizing definitions
  const sizes = {
    sm: { svgWidth: 32, svgHeight: 26, textClass: "text-sm", subClass: "text-[5px]" },
    md: { svgWidth: 44, svgHeight: 36, textClass: "text-lg", subClass: "text-[7px]" },
    lg: { svgWidth: 60, svgHeight: 49, textClass: "text-2xl", subClass: "text-[9.5px]" },
    xl: { svgWidth: 90, svgHeight: 74, textClass: "text-3xl", subClass: "text-[12px]" },
  };

  const { svgWidth, svgHeight, textClass, subClass } = sizes[size];
  const textColorMaa = light ? "text-white" : "text-[#222222]";
  const textColorSub = light ? "text-white/60" : "text-[#666666]";

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Handcrafted high-fidelity SVG monogram */}
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox="0 0 160 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 animate-fade-in"
      >
        {/* M Letter (Black / White if light) */}
        <path
          d="M30 110V30L65 70L95 38"
          stroke={light ? "#FFFFFF" : "#222222"}
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* R Letter (Deep Burgundy) */}
        <path
          d="M95 38V110M95 38H125C142 38 152 48 152 64C152 79 142 88 125 88H95M95 88L138 110"
          stroke="#7A2E2E"
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Window grid (2x2) under the intersection (Black / White if light) */}
        <rect
          x="83"
          y="95"
          width="9"
          height="9"
          fill={light ? "#FFFFFF" : "#222222"}
        />
        <rect
          x="95"
          y="95"
          width="9"
          height="9"
          fill={light ? "#FFFFFF" : "#222222"}
        />
        <rect
          x="83"
          y="107"
          width="9"
          height="9"
          fill={light ? "#FFFFFF" : "#222222"}
        />
        <rect
          x="95"
          y="107"
          width="9"
          height="9"
          fill={light ? "#FFFFFF" : "#222222"}
        />
      </svg>

      {/* Responsive Typography matching logo */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className={`font-extrabold tracking-wider ${textClass}`}>
            <span className={textColorMaa}>MAA</span>{" "}
            <span className="text-[#7A2E2E]">RADIO</span>
          </div>
          <div
            className={`font-semibold tracking-[0.2em] mt-1.5 whitespace-nowrap uppercase ${textColorSub} ${subClass}`}
          >
            Mobiles • Accessories • Home Appliances
          </div>
        </div>
      )}
    </div>
  );
}
