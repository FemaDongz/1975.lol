"use client";

import { useEffect, useRef } from "react";

// Intro / hero pixel: sekuens teks pixel (default: "1975" saja).
// Tiap teks: muncul RGB kedip -> diam putih glow -> padam merah -> jeda.
// Props: loop (ulang sekuens terus, untuk hero), texts (daftar teks).

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

// Huruf kapital 9 baris (COMING SOON, IG, F) + huruf kecil 9 baris + spasi + titik dua.
const GLYPHS_9: Record<string, string[]> = {
  C: [
    " █████",
    "██████",
    "██    ",
    "██    ",
    "██    ",
    "██    ",
    "██    ",
    "██████",
    " █████",
  ],
  O: [
    " ████ ",
    "██████",
    "██  ██",
    "██  ██",
    "██  ██",
    "██  ██",
    "██  ██",
    "██████",
    " ████ ",
  ],
  M: [
    "██   ██",
    "███ ███",
    "███████",
    "██ █ ██",
    "██   ██",
    "██   ██",
    "██   ██",
    "██   ██",
    "██   ██",
  ],
  I: ["███", "███", " ██", " ██", " ██", " ██", " ██", "███", "███"],
  N: [
    "██   ██",
    "███  ██",
    "████ ██",
    "████ ██",
    "██ ████",
    "██ ████",
    "██  ███",
    "██   ██",
    "██   ██",
  ],
  G: [
    " █████",
    "██████",
    "██    ",
    "██    ",
    "██ ███",
    "██  ██",
    "██  ██",
    "██████",
    " █████",
  ],
  S: [
    " █████",
    "██████",
    "██    ",
    "█████ ",
    " █████",
    "    ██",
    "    ██",
    "██████",
    "█████ ",
  ],
  T: [
    "███████",
    "███████",
    "  ███  ",
    "  ███  ",
    "  ███  ",
    "  ███  ",
    "  ███  ",
    "  ███  ",
    "  ███  ",
  ],
  F: [
    "██████",
    "██████",
    "██    ",
    "██    ",
    "█████ ",
    "█████ ",
    "██    ",
    "██    ",
    "██    ",
  ],
  E: [
    "██████",
    "██████",
    "██    ",
    "██    ",
    "█████ ",
    "█████ ",
    "██    ",
    "██████",
    "██████",
  ],
  A: [
    "  ███  ",
    " █████ ",
    "██   ██",
    "██   ██",
    "███████",
    "███████",
    "██   ██",
    "██   ██",
    "██   ██",
  ],
  D: [
    "█████ ",
    "██████",
    "██  ██",
    "██  ██",
    "██  ██",
    "██  ██",
    "██  ██",
    "██████",
    "█████ ",
  ],
  R: [
    "██████ ",
    "██   ██",
    "██   ██",
    "██   ██",
    "██████ ",
    "█████  ",
    "██  ██ ",
    "██   ██",
    "██   ██",
  ],
  e: [
    "     ",
    "     ",
    "     ",
    " ███ ",
    "█   █",
    "█████",
    "█    ",
    " ████",
    "     ",
  ],
  m: [
    "         ",
    "         ",
    "         ",
    "█   █   █",
    "████ ████",
    "█ █   █ █",
    "█ █   █ █",
    "█ █   █ █",
    "         ",
  ],
  a: [
    "     ",
    "     ",
    "     ",
    " ███ ",
    "    █",
    " ████",
    "█   █",
    " ████",
    "     ",
  ],
  n: [
    "      ",
    "      ",
    "      ",
    "█ ███ ",
    "██  ██",
    "██  ██",
    "██  ██",
    "██  ██",
    "      ",
  ],
  d: [
    "    ██",
    "    ██",
    "    ██",
    " █████",
    "██  ██",
    "██  ██",
    "██  ██",
    " █████",
    "      ",
  ],
  r: [
    "     ",
    "     ",
    "     ",
    "██ ██",
    "███  ",
    "██   ",
    "██   ",
    "██   ",
    "     ",
  ],
  f: [
    "  ██ ",
    "  ██ ",
    " ████",
    "  ██ ",
    "  ██ ",
    "  ██ ",
    "  ██ ",
    "  ██ ",
    "     ",
  ],
  ":": [
    "   ",
    "   ",
    " █ ",
    " █ ",
    "   ",
    "   ",
    " █ ",
    " █ ",
    "   ",
  ],
  "[": [
    "████",
    "██  ",
    "██  ",
    "██  ",
    "██  ",
    "██  ",
    "██  ",
    "██  ",
    "████",
  ],
  "]": [
    "████",
    "  ██",
    "  ██",
    "  ██",
    "  ██",
    "  ██",
    "  ██",
    "  ██",
    "████",
  ],
  " ": ["   ", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "   "],
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

type TextArt = {
  pixels: Pixel[];
  size: number;
};

function glyphOf(ch: string): { rows: string[]; h: number } {
  if (GLYPHS_1975[ch]) return { rows: GLYPHS_1975[ch], h: 11 };
  return { rows: GLYPHS_9[ch] ?? GLYPHS_9[" "], h: 9 };
}

export type TextEntry = {
  single: string[];
  stacked?: string[][];
};

export default function PixelIntro({
  onDone,
  loop = false,
  texts = [{ single: TEXT_1975 }],
  cols = 7,
}: {
  onDone: () => void;
  loop?: boolean;
  texts?: TextEntry[];
  cols?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textsRef = useRef(texts);
  textsRef.current = texts;

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;

    const entries = textsRef.current;
    let arts: TextArt[] = [];

    // Timeline per teks
    const T_INITIAL_DELAY = 700;
    const T_APPEAR = 1700;
    const T_HOLD = 2400;
    const T_VANISH = 1500;
    const T_GAP = 800;

    type Seg = {
      art: number;
      start: number;
      appearEnd: number;
      holdEnd: number;
      vanishEnd: number;
      end: number;
    };
    let segs: Seg[] = [];
    let TOTAL = T_INITIAL_DELAY;
    entries.forEach((_, i) => {
      const start = TOTAL;
      const appearEnd = start + T_APPEAR;
      const holdEnd = appearEnd + T_HOLD;
      const vanishEnd = holdEnd + T_VANISH;
      const end = vanishEnd + T_GAP;
      segs.push({ art: i, start, appearEnd, holdEnd, vanishEnd, end });
      TOTAL = end;
    });

    let startTime: number | null = null;
    let rafId = 0;
    let finished = false;

    function colsOf(line: string[], spacing: number): number {
      let cols = 0;
      line.forEach((ch, i) => {
        cols += glyphOf(ch).rows[0].length;
        if (i < line.length - 1) cols += spacing;
      });
      return cols;
    }

    // Ukuran pixel teks proporsional grid background (7 sel selebar canvas):
    // ambil pembagi bulat dari sel background supaya selaras.
    function snappedSize(cols: number, rows: number, wMul = 0.7, hMul = 0.45) {
      const bgCell = canvas.width / cols;
      if (!(bgCell > 0)) return 5;
      const fit =
        Math.min((canvas.width * wMul) / cols, (canvas.height * hMul) / rows) ||
        5;
      let k = Math.max(1, Math.round(bgCell / Math.max(1, fit)));
      let size = Math.max(5, Math.floor(bgCell / k));
      let guard = 0;
      while (
        (cols * size > canvas.width * wMul ||
          rows * size > canvas.height * hMul) &&
        size > 5 &&
        guard < 64
      ) {
        k++;
        size = Math.max(5, Math.floor(bgCell / k));
        guard++;
      }
      return size;
    }

    function layoutLines(
      linesArr: string[][],
      size: number,
      gapRows: number
    ): TextArt {
      const infos = linesArr.map((line) => {
        const rows = glyphOf(line[0]).h;
        const spacing = rows === 11 ? 2 : 1;
        return { line, rows, spacing, cols: colsOf(line, spacing) };
      });
      const totalRows =
        infos.reduce((a, b) => a + b.rows, 0) + gapRows * (infos.length - 1);
      const blockH = totalRows * size;
      let y = Math.floor((canvas.height - blockH) / 2);
      const pixels: Pixel[] = [];
      infos.forEach((info) => {
        const totalW = info.cols * size;
        let curX = Math.floor((canvas.width - totalW) / 2);
        info.line.forEach((ch) => {
          const { rows: matrix } = glyphOf(ch);
          const charW = matrix[0].length;
          for (let r = 0; r < info.rows; r++) {
            for (let c = 0; c < charW; c++) {
              if (matrix[r][c] === "█") {
                pixels.push({
                  baseX: curX + c * size,
                  baseY: y + r * size,
                  appearTime: Math.random() * 0.76,
                  disappearTime: Math.random() * 0.76,
                  rgbColor:
                    RGB_PALETTE[Math.floor(Math.random() * RGB_PALETTE.length)],
                });
              }
            }
          }
          curX += (charW + info.spacing) * size;
        });
        y += (info.rows + gapRows) * size;
      });
      return { pixels, size };
    }

    function buildEntry(entry: TextEntry): TextArt {
      const sRows = glyphOf(entry.single[0]).h;
      const sSp = sRows === 11 ? 2 : 1;
      const sSize = snappedSize(colsOf(entry.single, sSp), sRows);
      // Layar kecil & ada varian susun: tampil dua baris supaya tetap besar.
      if (entry.stacked && sSize < 11) {
        const infos = entry.stacked.map((line) => {
          const rows = glyphOf(line[0]).h;
          return { cols: colsOf(line, 1), rows };
        });
        const gapRows = 2;
        const totalRows =
          infos.reduce((a, b) => a + b.rows, 0) + gapRows * (infos.length - 1);
        const size = Math.min(
          ...infos.map((b) => snappedSize(b.cols, totalRows, 0.7, 0.5))
        );
        return layoutLines(entry.stacked, size, gapRows);
      }
      return layoutLines([entry.single], sSize, 0);
    }

    function build() {
      arts = entries.map((t) => buildEntry(t));
      // waktu acak baru tiap build (untuk loop)
      arts.forEach((a) =>
        a.pixels.forEach((p) => {
          p.appearTime = Math.random() * 0.76;
          p.disappearTime = Math.random() * 0.76;
          p.rgbColor =
            RGB_PALETTE[Math.floor(Math.random() * RGB_PALETTE.length)];
        })
      );
    }

    function resize() {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      build();
    }
    window.addEventListener("resize", resize);
    resize();

    // Batch glow: shadowBlur (mahal di HP) diset SEKALI per jenis, bukan
    // per-pixel. Gambar semua persegi dulu, baru blur-nya. Ini yang bikin
    // teks 2 baris tetap lancar.
    function drawBatch(
      px: { x: number; y: number }[],
      s: number,
      color: string,
      blurMul: number
    ) {
      if (!px.length) return;
      // lapisan glow (satu blur untuk semua)
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = s * blurMul;
      ctx.fillStyle = color;
      for (let i = 0; i < px.length; i++) ctx.fillRect(px[i].x, px[i].y, s, s);
      ctx.restore();
      // inti putih (tanpa shadow)
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < px.length; i++) ctx.fillRect(px[i].x, px[i].y, s, s);
    }

    function render(timestamp: number) {
      if (!startTime) startTime = timestamp;
      let elapsed = timestamp - startTime;
      if (loop && TOTAL > 0) elapsed = elapsed % TOTAL;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const seg = segs.find((g) => elapsed >= g.start && elapsed < g.end);
      if (seg) {
        const art = arts[seg.art];
        if (elapsed < seg.appearEnd) {
          const progress = (elapsed - seg.start) / T_APPEAR;
          // kumpulkan per warna supaya batch (glow sekali)
          const white: { x: number; y: number }[] = [];
          const rgbByColor = new Map<string, { x: number; y: number }[]>();
          art.pixels.forEach((p) => {
            if (progress < p.appearTime) return;
            const since = progress - p.appearTime;
            if (since < 0.24) {
              if (Math.random() < 0.52) {
                const dyn =
                  Math.random() < 0.35
                    ? RGB_PALETTE[Math.floor(Math.random() * RGB_PALETTE.length)]
                    : p.rgbColor;
                const arr = rgbByColor.get(dyn) ?? [];
                arr.push({ x: p.baseX, y: p.baseY });
                rgbByColor.set(dyn, arr);
              }
            } else {
              white.push({ x: p.baseX, y: p.baseY });
            }
          });
          rgbByColor.forEach((arr, color) => drawBatch(arr, art.size, color, 1.5));
          drawBatch(white, art.size, "#ffffff", 1.8);
        } else if (elapsed < seg.holdEnd) {
          drawBatch(
            art.pixels.map((p) => ({ x: p.baseX, y: p.baseY })),
            art.size,
            "#ffffff",
            1.8
          );
        } else if (elapsed < seg.vanishEnd) {
          const progress = (elapsed - seg.holdEnd) / T_VANISH;
          const white: { x: number; y: number }[] = [];
          const red: { x: number; y: number }[] = [];
          art.pixels.forEach((p) => {
            if (progress > p.disappearTime + 0.24) return;
            if (progress > p.disappearTime) {
              if (Math.random() < 0.52) red.push({ x: p.baseX, y: p.baseY });
            } else {
              white.push({ x: p.baseX, y: p.baseY });
            }
          });
          drawBatch(white, art.size, "#ffffff", 1.8);
          drawBatch(red, art.size, "#ff0033", 1.2);
        }
      }

      if (!loop && elapsed >= TOTAL) {
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
  }, [onDone, loop, cols]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 3,
        width: "100%",
        height: "100%",
        borderRadius: "inherit",
        imageRendering: "pixelated",
      }}
    />
  );
}
