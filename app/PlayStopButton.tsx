"use client";

import * as React from "react";

type DotGroupProps = {
  index: number;
  dotColor: string;
};

function DotGroup({ index, dotColor }: DotGroupProps) {
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

export type PlayStopButtonProps = {
  className?: string;
  initialMode?: "PLAY" | "STOP";
  onModeChange?: (newMode: "PLAY" | "STOP") => void;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">;

export const AntiMetalButton = React.forwardRef<
  HTMLButtonElement,
  PlayStopButtonProps
>(function AntiMetalButton(
  { className, initialMode = "PLAY", onModeChange, style, ...rest },
  ref
) {
  const [mode, setMode] = React.useState<"PLAY" | "STOP">(initialMode);
  const [hover, setHover] = React.useState(false);
  const [animatingSlab, setAnimatingSlab] = React.useState(false);
  // true selama siklus klik berlangsung -> hover diabaikan (slab tak nyangkut penuh)
  const [clicking, setClicking] = React.useState(false);
  const isBusyRef = React.useRef(false);

  const isPlay = mode === "PLAY";

  // Konfigurasi tema warna & glow
  const theme = isPlay
    ? {
        text: "PLAY",
        textColor: "#ffffff",
        textGlow:
          "0 0 8px rgba(255,255,255,0.8), 0 0 18px rgba(255,255,255,0.4)",
        slabFrom: "#ffffff",
        slabTo: "#e2e2e2",
        slabGlow:
          "0 0 14px rgba(255,255,255,0.6), inset 0 1px 0 #ffffff, inset 0 -2px 4px rgba(0,0,0,0.15)",
        dotColor: "#0a0a0a",
        btnBorder: "rgba(255, 255, 255, 0.22)",
        btnGlow:
          "0 0 20px rgba(255, 255, 255, 0.12), inset 0 0 12px rgba(255,255,255,0.06)",
      }
    : {
        text: "STOP",
        textColor: "#ff4d4d",
        textGlow:
          "0 0 8px rgba(255,77,77,0.85), 0 0 20px rgba(239,68,68,0.5)",
        slabFrom: "#ff3b3b",
        slabTo: "#d31313",
        slabGlow:
          "0 0 16px rgba(239, 68, 68, 0.8), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.3)",
        dotColor: "#200303",
        btnBorder: "rgba(239, 68, 68, 0.35)",
        btnGlow:
          "0 0 22px rgba(239, 68, 68, 0.25), inset 0 0 14px rgba(239,68,68,0.12)",
      };

  // Slab melebar saat klik (animasi) atau hover. Saat siklus klik berjalan,
  // hover DIABAIKAN supaya slab otomatis balik ke kecil tanpa nunggu lepas hover.
  const isExpanded = animatingSlab || (hover && !clicking);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isBusyRef.current) return;
    isBusyRef.current = true;
    setClicking(true);
    setHover(false);

    // 1. Luncurkan slab sampai penuh
    setAnimatingSlab(true);

    // 2. Setelah penuh, tarik balik ke posisi awal (otomatis, tanpa syarat)
    setTimeout(() => {
      setAnimatingSlab(false);
      // 3. Setelah slab benar-benar kembali tertutup, barulah ganti mode
      setTimeout(() => {
        const nextMode = mode === "PLAY" ? "STOP" : "PLAY";
        setMode(nextMode);
        onModeChange?.(nextMode);
        setClicking(false);
        isBusyRef.current = false;
      }, 260);
    }, 280);
    void e;
  };

  return (
    <button
      ref={ref}
      className={className}
      onClick={handleClick}
      onMouseEnter={() => !isBusyRef.current && setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => !isBusyRef.current && setHover(true)}
      onBlur={() => setHover(false)}
      style={{
        position: "relative",
        display: "inline-flex",
        height: 44,
        width: 116, // pas untuk teks 4 huruf (PLAY / STOP)
        overflow: "hidden",
        borderRadius: 12,
        border: `1px solid ${theme.btnBorder}`,
        cursor: "pointer",
        padding: 0,
        background: "linear-gradient(180deg, #161616 0%, #070707 100%)",
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 16px rgba(0,0,0,0.4), ${theme.btnGlow}`,
        transition:
          "border-color 0.25s ease, box-shadow 0.25s ease, transform 0.15s ease",
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

      {/* Layer Noise Texture yang menyelimuti seluruh button & radius */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          pointerEvents: "none",
          opacity: 0.14,
          mixBlendMode: "overlay",
          zIndex: 2,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Label Text PLAY / STOP */}
      <span
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 18,
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: theme.textColor,
          textShadow: theme.textGlow,
          transition: "color 0.2s ease, text-shadow 0.2s ease",
          userSelect: "none",
        }}
      >
        {theme.text}
      </span>

      {/* Slab yang melebar dan kembali */}
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
          // kecil: 1 dot di tengah ; penuh: dot memanjang ke kanan
          justifyContent: isExpanded ? "flex-start" : "center",
          width: isExpanded ? "calc(100% - 8px)" : 36,
          overflow: "hidden",
          borderRadius: 8,
          paddingLeft: isExpanded ? 11 : 0,
          paddingRight: isExpanded ? 10 : 0,
          background: `linear-gradient(180deg, ${theme.slabFrom} 0%, ${theme.slabTo} 100%)`,
          boxShadow: theme.slabGlow,
          transition:
            "width 0.26s cubic-bezier(0.65, 0, 0.35, 1), padding 0.26s cubic-bezier(0.65, 0, 0.35, 1), background 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        <DotGroup index={0} dotColor={theme.dotColor} />
        {isExpanded && (
          <>
            <span style={{ display: "inline-flex", marginLeft: 8 }}>
              <DotGroup index={1} dotColor={theme.dotColor} />
            </span>
            <span style={{ display: "inline-flex", marginLeft: 8 }}>
              <DotGroup index={2} dotColor={theme.dotColor} />
            </span>
            <span style={{ display: "inline-flex", marginLeft: 8 }}>
              <DotGroup index={3} dotColor={theme.dotColor} />
            </span>
            <span style={{ display: "inline-flex", marginLeft: 8 }}>
              <DotGroup index={4} dotColor={theme.dotColor} />
            </span>
          </>
        )}
      </span>
    </button>
  );
});

export default AntiMetalButton;
