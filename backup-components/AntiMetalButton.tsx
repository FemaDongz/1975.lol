"use client";

import * as React from "react";

// AntiMetalButton — direkonstruksi dari bundle publik 21st.dev
// (@smammar / anti-metal-button). Tombol dark + wave titik berjenjang +
// slab aksen yang melebar saat hover.
//
// Versi ini mandiri (tanpa Tailwind): styling via inline style + <style>.

type DoubleChevronProps = {
  index: number;
  dotColor: string;
};

function DotGroup({ index, dotColor }: DoubleChevronProps) {
  const baseDelay = index * 0.12;
  const dots = [
    { cx: 2, cy: 2, d: 0 },
    { cx: 5, cy: 5, d: 0.05 },
    { cx: 8, cy: 8, d: 0.1 },
    { cx: 5, cy: 11, d: 0.15 },
    { cx: 2, cy: 14, d: 0.2 },
    { cx: 6, cy: 2, d: 0.05 },
    { cx: 9, cy: 5, d: 0.1 },
    { cx: 12, cy: 8, d: 0.15 },
    { cx: 9, cy: 11, d: 0.2 },
    { cx: 6, cy: 14, d: 0.25 },
  ];
  return (
    <svg
      width="14"
      height="16"
      viewBox="0 0 14 16"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0, overflow: "visible" }}
    >
      <g fill={dotColor}>
        {dots.map((o, i) => (
          <circle
            key={i}
            cx={o.cx}
            cy={o.cy}
            r="1"
            className="amb-dot"
            style={{ animationDelay: `${baseDelay + o.d}s` }}
          />
        ))}
      </g>
    </svg>
  );
}

export type AntiMetalButtonProps = {
  className?: string;
  label?: string;
  accentFrom?: string;
  accentTo?: string;
  dotColor?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const AntiMetalButton = React.forwardRef<
  HTMLButtonElement,
  AntiMetalButtonProps
>(function AntiMetalButton(
  {
    className,
    children,
    label,
    accentFrom = "#d6f54a",
    accentTo = "#c5ea2c",
    dotColor = "#0f0f0f",
    style,
    ...rest
  },
  ref
) {
  const text = label ?? (children as React.ReactNode) ?? "Book a demo";
  const [hover, setHover] = React.useState(false);
  return (
    <button
      ref={ref}
      className={className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{
        position: "relative",
        display: "inline-flex",
        height: 44,
        width: 144,
        overflow: "hidden",
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        padding: 0,
        background: "linear-gradient(180deg,#1a1a1a 0%,#0a0a0a 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.18)",
        transition: "transform 0.15s ease",
        ...style,
      }}
      {...rest}
    >
      <style>{`
        @keyframes bd-dot-wave {
          0%, 70%, 100% { opacity: 0.25; transform: scale(0.85); }
          35% { opacity: 1; transform: scale(1); }
        }
        .amb-dot {
          transform-box: fill-box;
          transform-origin: center;
          animation: bd-dot-wave 1.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .amb-dot { animation: none; opacity: 1; }
        }
      `}</style>
      <span
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 16,
          display: "flex",
          alignItems: "center",
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          color: "#ffffff",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </span>
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 4,
          bottom: 4,
          left: 4,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: hover ? 10 : 10,
          width: hover ? "calc(100% - 8px)" : 36,
          overflow: "hidden",
          borderRadius: 8,
          paddingLeft: 12,
          paddingRight: 10,
          background: `linear-gradient(180deg, ${accentFrom} 0%, ${accentTo} 100%)`,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)",
          transition:
            "width 0.2s cubic-bezier(0.65,0,0.35,1), gap 0.2s cubic-bezier(0.65,0,0.35,1)",
        }}
      >
        <DotGroup index={0} dotColor={dotColor} />
        <DotGroup index={1} dotColor={dotColor} />
        <DotGroup index={2} dotColor={dotColor} />
        <DotGroup index={3} dotColor={dotColor} />
        <DotGroup index={4} dotColor={dotColor} />
      </span>
    </button>
  );
});

export default AntiMetalButton;
