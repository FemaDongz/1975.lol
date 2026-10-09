"use client";

import { useEffect, useRef } from "react";

// Intro: animasi pixel "1975" (dark, tanpa ripple).
// Fase: muncul RGB kedip -> diam putih glow -> padam merah -> fade out -> onDone.

const GLYPHS_1975: Record<string, string[]> = {
  "1": [
    "  ████  ",
    " ████  ",
    "   ██   ",
    "   ██   ",
    "   ██   ",
    "   ██   ",
    "   ██   ",
    "   ██   ",
    "   ██   ",
    " ██████ ",
    "████████",
  ],
  "9": [
    " █████ ",
    "███ ███",
    "██   ██",
    "███ ███",
    " ██████",
    "    ███",
    "     ██",
    "     ██",
    "     ██",
    "███ ███",
    " █████ ",
  ],
  "7": [
    " █████ ",
    "███████",
    "    ███",
    "   ███ ",
    "   ███ ",
    "  ███  ",
    "  ███  ",
    " ███   ",
    " ███   ",
    "███    ",
    "███    ",
  ],
  "5": [
    " █████ ",
    "███████",
    "███    ",
    "██     ",
    " █████ ",
    "   ████",
    "    ███",
    "     ██",
    "     ██",
    "███ ███",
    " █████ ",
  ],
};

const TEXT_1975 = ["1", "9", "7", "5"];

const RGB_PALETTE = [
  "#00f0ff",
  "#ff0077",
  "#ffe600",
  "#00ff66",
  "#7b00ff",
  "#ff3b00",
  "#0066ff",
];

type Pixel = {
  baseX: number;
  baseY: number;
  appearTime: number;
  disappearTime: number;
  rgbColor: string;
};

export default function PixelIntro({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;

    let unifiedPixelSize = 8;
    let pixels1975: Pixel[] = [];

    // Timeline
    const T_INITIAL_DELAY = 700;
    const T_APPEAR = 1700;
    const T_HOLD = 1600;
    const T_VANISH = 1500;

    const TIME_START = T_INITIAL_DELAY;
    const TIME_HOLD = TIME_START + T_APPEAR;
    const TIME_VANISH = TIME_HOLD + T_HOLD;
    const TIME_END = TIME_VANISH + T_VANISH;
    const TOTAL = TIME_END;

    let startTime: number | null = null;
    let rafId = 0;
    let finished = false;

    function getTotalCols() {
      let cols = 0;
      for (let i = 0; i < TEXT_1975.length; i++) {
        cols += GLYPHS_1975[TEXT_1975[i]][0].length;
        if (i < TEXT_1975.length - 1) cols += 2;
      }
      return cols;
    }

    function build() {
      const totalCols = getTotalCols();
      const baseSize = Math.min(
        (canvas.width * 0.8) / totalCols,
        (canvas.height * 0.42) / 11
      );
      unifiedPixelSize = Math.max(4, Math.floor(baseSize));

      const totalWidth = totalCols * unifiedPixelSize;
      const startX = Math.floor((canvas.width - totalWidth) / 2);
      const startY = Math.floor((canvas.height - 11 * unifiedPixelSize) / 2);

      pixels1975 = [];
      let curX = startX;
      TEXT_1975.forEach((char) => {
        const matrix = GLYPHS_1975[char];
        const charW = matrix[0].length;
        for (let r = 0; r < 11; r++) {
          for (let c = 0; c < charW; c++) {
            if (matrix[r][c] === "█") {
              pixels1975.push({
                baseX: curX + c * unifiedPixelSize,
                baseY: startY + r * unifiedPixelSize,
                appearTime: Math.random() * 0.76,
                disappearTime: Math.random() * 0.76,
                rgbColor:
                  RGB_PALETTE[Math.floor(Math.random() * RGB_PALETTE.length)],
              });
            }
          }
        }
        curX += (charW + 2) * unifiedPixelSize;
      });
    }

    function resize() {
      // Pakai ukuran elemen (frame), bukan window, supaya angka center di frame.
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      build();
    }
    window.addEventListener("resize", resize);
    resize();

    function drawRgb(x: number, y: number, s: number, color: string) {
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = s * 1.5;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, s, s);
      ctx.shadowBlur = s * 0.4;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, s, s);
      ctx.restore();
    }
    function drawWhite(x: number, y: number, s: number) {
      ctx.save();
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = s * 1.8;
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.fillRect(x, y, s, s);
      ctx.shadowBlur = s * 0.5;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, s, s);
      ctx.restore();
    }
    function drawRed(x: number, y: number, s: number) {
      ctx.save();
      ctx.shadowColor = "#ff0033";
      ctx.shadowBlur = s * 1.2;
      ctx.fillStyle = "#ff0033";
      ctx.fillRect(x, y, s, s);
      ctx.shadowBlur = s * 0.3;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, s, s);
      ctx.restore();
    }

    function render(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // Latar transparan: biarkan frame rounded + warna luar tembus.
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (elapsed >= TIME_START && elapsed < TIME_HOLD) {
        const progress = (elapsed - TIME_START) / T_APPEAR;
        pixels1975.forEach((p) => {
          if (progress < p.appearTime) return;
          const since = progress - p.appearTime;
          if (since < 0.24) {
            if (Math.random() < 0.52) {
              const dyn =
                Math.random() < 0.35
                  ? RGB_PALETTE[Math.floor(Math.random() * RGB_PALETTE.length)]
                  : p.rgbColor;
              drawRgb(p.baseX, p.baseY, unifiedPixelSize, dyn);
            }
          } else {
            drawWhite(p.baseX, p.baseY, unifiedPixelSize);
          }
        });
      } else if (elapsed >= TIME_HOLD && elapsed < TIME_VANISH) {
        pixels1975.forEach((p) => drawWhite(p.baseX, p.baseY, unifiedPixelSize));
      } else if (elapsed >= TIME_VANISH && elapsed < TIME_END) {
        const progress = (elapsed - TIME_VANISH) / T_VANISH;
        pixels1975.forEach((p) => {
          if (progress > p.disappearTime + 0.24) return;
          if (progress > p.disappearTime) {
            if (Math.random() < 0.52)
              drawRed(p.baseX, p.baseY, unifiedPixelSize);
          } else {
            drawWhite(p.baseX, p.baseY, unifiedPixelSize);
          }
        });
      }

      if (elapsed >= TIME_END) {
        if (!finished) {
          finished = true;
          onDone();
        }
        return;
      }
      rafId = requestAnimationFrame(render);
    }
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [onDone]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1, // di bawah ripple (z-2) supaya angka tertimpa garis ink
        width: "100%",
        height: "100%",
        borderRadius: "inherit",
        imageRendering: "pixelated",
      }}
    />
  );
}
