"use client";

import { useEffect, useRef } from "react";

// =========================================================================
// 1. MATRIKS PIXEL "1975" (Tinggi 11)
// =========================================================================
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

// =========================================================================
// 2. MATRIKS PIXEL "COMING SOON" (Tinggi 9)
// =========================================================================
const GLYPHS_CS: Record<string, string[]> = {
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
  B: [
    "█████ ",
    "██████",
    "██  ██",
    "██  ██",
    "██████",
    "██████",
    "██  ██",
    "██████",
    "█████ ",
  ],
  Y: [
    "██   ██",
    "██   ██",
    "██   ██",
    " █████ ",
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
  P: [
    "██████",
    "██████",
    "██  ██",
    "██  ██",
    "██████",
    "█████ ",
    "██    ",
    "██    ",
    "██    ",
  ],
  L: [
    "██    ",
    "██    ",
    "██    ",
    "██    ",
    "██    ",
    "██    ",
    "██    ",
    "██████",
    "██████",
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
  " ": ["   ", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "   "],
};

const TEXT_1975 = ["1", "9", "7", "5"];
const TEXT_CS = ["C", "O", "M", "I", "N", "G", " ", "S", "O", "O", "N"];
const TEXT_BY = ["B", "Y", " ", "F", "E", "M", "A"];
const TEXT_PLAY = ["P", "L", "A", "Y"];
const TEXT_STOP = ["S", "T", "O", "P"];

const RGB_PALETTE = [
  "#00f0ff",
  "#ff0077",
  "#ffe600",
  "#00ff66",
  "#7b00ff",
  "#ff3b00",
  "#0066ff",
];

const ACCENT_COLORS = [
  "#00f0ff",
  "#a855f7",
  "#ffaa00",
  "#ff0077",
  "#00ff66",
  "#3b82f6",
];

type Pixel = {
  baseX: number;
  baseY: number;
  appearTime: number;
  disappearTime: number;
  rgbColor: string;
};

type TileType = "protruding" | "sunken";

type Box = { x: number; y: number; w: number; h: number };

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;

    // Audio: CDN jsDelivr dulu (ngebut), fallback ke file lokal Vercel
    const CDN_SRC =
      "https://cdn.jsdelivr.net/gh/FemaDongz/1975.lol@main/public/audio/about-you.mp3";
    const LOCAL_SRC = "/audio/about-you.mp3";
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "auto";
    audio.src = CDN_SRC;
    let useLocal = false;
    const ensureLocalSrc = () => {
      if (!useLocal) {
        useLocal = true;
        audio.src = LOCAL_SRC;
      }
    };
    audio.addEventListener("error", ensureLocalSrc);

    const togglePlay = () => {
      if (audio.paused) {
        const pr = audio.play();
        if (pr) {
          pr.then(() => {
            isPlaying = true;
          }).catch(() => {
            // CDN gagal (misal cache belum update) -> coba file lokal
            ensureLocalSrc();
            const pr2 = audio.play();
            if (pr2) {
              pr2.then(() => {
                isPlaying = true;
              }).catch(() => {});
            }
          });
        } else {
          isPlaying = true;
        }
      } else {
        audio.pause();
        isPlaying = false;
      }
    };

    const bgGridCanvas = document.createElement("canvas");

    let unifiedPixelSize = 8;
    let pixels1975: Pixel[] = [];
    let pixelsCS: Pixel[] = [];
    let box1975: Box = { x: 0, y: 0, w: 0, h: 0 };
    let boxCS: Box = { x: 0, y: 0, w: 0, h: 0 };
    let pixelsBY: Pixel[] = [];
    let boxBY: Box = { x: 0, y: 0, w: 0, h: 0 };

    // State tombol pixel PLAY/STOP
    let btnHover = false;
    let isPlaying = false;
    const btnRect = { x: 0, y: 0, w: 0, h: 0, visible: false };

    // --- CLASS TILE 3D ACAK BERPINDAH (MENDALAM & MENONJOL) ---
    class DynamicTile {
      type: TileType;
      col = 0;
      row = 0;
      color = "#ffffff";
      duration = 3000;
      progress = 0;
      maxAlpha = 0.3;

      constructor(type: TileType) {
        this.type = type;
        this.reset();
        this.progress = Math.random();
      }

      reset() {
        const numCols = Math.ceil(canvas!.width / unifiedPixelSize);
        const numRows = Math.ceil(canvas!.height / unifiedPixelSize);
        this.col = Math.floor(Math.random() * numCols);
        this.row = Math.floor(Math.random() * numRows);
        this.color =
          ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];
        this.duration = 2400 + Math.random() * 3200;
        this.progress = 0;
        this.maxAlpha =
          this.type === "protruding"
            ? 0.28 + Math.random() * 0.35
            : 0.55 + Math.random() * 0.3;
      }

      update(dt: number) {
        this.progress += dt / this.duration;
        if (this.progress >= 1) {
          this.reset();
        }
      }

      draw(
        context: CanvasRenderingContext2D,
        originX: number,
        originY: number,
        pSize: number,
        cx: number,
        cy: number,
        maxRadius: number
      ) {
        const x = originX + this.col * pSize;
        const y = originY + this.row * pSize;

        const dist = Math.hypot(x + pSize / 2 - cx, y + pSize / 2 - cy);
        if (dist > maxRadius) return;
        const vigAlpha = Math.max(0, 1 - dist / maxRadius);

        const curve = Math.sin(this.progress * Math.PI);
        const alpha = curve * this.maxAlpha * vigAlpha;
        if (alpha <= 0.015) return;

        context.save();
        context.globalAlpha = alpha;

        if (this.type === "protruding") {
          // === 3D MENONJOL (RAISED) + NEON GLOW WARNA-WARNI ===
          context.shadowColor = this.color;
          context.shadowBlur = pSize * 1.1;
          context.fillStyle = this.color;
          context.fillRect(x + 1, y + 1, pSize - 2, pSize - 2);

          context.shadowBlur = 0;
          context.fillStyle = "rgba(255, 255, 255, 0.65)";
          context.fillRect(x + 1, y + 1, pSize - 2, 1);
          context.fillRect(x + 1, y + 1, 1, pSize - 2);

          context.fillStyle = "rgba(0, 0, 0, 0.85)";
          context.fillRect(x + 1, y + pSize - 2, pSize - 2, 1);
          context.fillRect(x + pSize - 2, y + 1, 1, pSize - 2);
        } else {
          // === 3D MENDALAM (SUNKEN CAVITY) - ABU-ABU / HITAM PEKAT ===
          context.fillStyle = "#020306";
          context.fillRect(x + 1, y + 1, pSize - 2, pSize - 2);

          context.fillStyle = "rgba(0, 0, 0, 0.95)";
          context.fillRect(x, y, pSize, 1.5);
          context.fillRect(x, y, 1.5, pSize);

          context.fillStyle = "rgba(255, 255, 255, 0.15)";
          context.fillRect(x, y + pSize - 1, pSize, 1);
          context.fillRect(x + pSize - 1, y, 1, pSize);
        }

        context.restore();
      }
    }

    let dynamicTiles: DynamicTile[] = [];

    // Timeline Durasi
    const T_INITIAL_DELAY = 1500;
    const T_1975_APPEAR = 1900;
    const T_1975_HOLD = 2500;
    const T_1975_VANISH = 1800;
    const T_GAP_1 = 1000; // Jeda gelap + morph box ke COMING SOON
    const T_CS_APPEAR = 1900;
    const T_CS_HOLD = 3800;
    const T_CS_VANISH = 1800;
    const T_GAP_2 = 1000; // Jeda gelap + morph box ke BY FEMA
    const T_BY_APPEAR = 1900; // BY FEMAANDARA Pixel RGB kedip
    const T_BY_HOLD = 3000; // BY FEMAANDARA Putih glow
    const T_BY_VANISH = 1800; // BY FEMAANDARA Merah kedip keluar
    const T_END_DELAY = 1200;

    const TIME_1975_START = T_INITIAL_DELAY;
    const TIME_1975_HOLD = TIME_1975_START + T_1975_APPEAR;
    const TIME_1975_VANISH = TIME_1975_HOLD + T_1975_HOLD;
    const TIME_1975_END = TIME_1975_VANISH + T_1975_VANISH;

    const TIME_CS_START = TIME_1975_END + T_GAP_1;
    const TIME_CS_HOLD = TIME_CS_START + T_CS_APPEAR;
    const TIME_CS_VANISH = TIME_CS_HOLD + T_CS_HOLD;
    const TIME_CS_END = TIME_CS_VANISH + T_CS_VANISH;

    const TIME_BY_START = TIME_CS_END + T_GAP_2;
    const TIME_BY_HOLD = TIME_BY_START + T_BY_APPEAR;
    const TIME_BY_VANISH = TIME_BY_HOLD + T_BY_HOLD;
    const TIME_BY_END = TIME_BY_VANISH + T_BY_VANISH;

    const TOTAL_CYCLE = TIME_BY_END + T_END_DELAY;

    let startTime: number | null = null;
    let lastTimestamp = 0;
    let rafId = 0;

    function getTotalCols1975() {
      let cols = 0;
      for (let i = 0; i < TEXT_1975.length; i++) {
        cols += GLYPHS_1975[TEXT_1975[i]][0].length;
        if (i < TEXT_1975.length - 1) cols += 2;
      }
      return cols;
    }

    function getTotalColsCS() {
      let cols = 0;
      for (let i = 0; i < TEXT_CS.length; i++) {
        cols += GLYPHS_CS[TEXT_CS[i]][0].length;
        if (i < TEXT_CS.length - 1) cols += 1;
      }
      return cols;
    }

    function getTotalColsBY() {
      let cols = 0;
      for (let i = 0; i < TEXT_BY.length; i++) {
        cols += GLYPHS_CS[TEXT_BY[i]][0].length;
        if (i < TEXT_BY.length - 1) cols += 1;
      }
      return cols;
    }

    function render3DSunkenBaseGrid(pSize: number, originX: number, originY: number) {
      bgGridCanvas.width = canvas!.width;
      bgGridCanvas.height = canvas!.height;
      const gCtx = bgGridCanvas.getContext("2d");
      if (!gCtx) return;

      gCtx.clearRect(0, 0, bgGridCanvas.width, bgGridCanvas.height);

      for (let x = originX; x < bgGridCanvas.width + pSize; x += pSize) {
        for (let y = originY; y < bgGridCanvas.height + pSize; y += pSize) {
          gCtx.fillStyle = "rgba(6, 7, 12, 0.9)";
          gCtx.fillRect(x + 1, y + 1, pSize - 2, pSize - 2);

          gCtx.fillStyle = "rgba(0, 0, 0, 0.95)";
          gCtx.fillRect(x, y, pSize, 1);
          gCtx.fillRect(x, y, 1, pSize);

          gCtx.fillStyle = "rgba(255, 255, 255, 0.06)";
          gCtx.fillRect(x, y + pSize - 1, pSize, 1);
          gCtx.fillRect(x + pSize - 1, y, 1, pSize);

          gCtx.strokeStyle = "rgba(255, 255, 255, 0.06)";
          gCtx.strokeRect(x + 1.5, y + 1.5, pSize - 3, pSize - 3);
        }
      }

      const cx = bgGridCanvas.width / 2;
      const cy = bgGridCanvas.height / 2;
      const maxRadius = Math.max(bgGridCanvas.width, bgGridCanvas.height) * 0.88;

      const vignette = gCtx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
      vignette.addColorStop(0, "rgba(0, 0, 0, 1)");
      vignette.addColorStop(0.35, "rgba(0, 0, 0, 0.90)");
      vignette.addColorStop(0.7, "rgba(0, 0, 0, 0.25)");
      vignette.addColorStop(1, "rgba(0, 0, 0, 0)");

      gCtx.globalCompositeOperation = "destination-in";
      gCtx.fillStyle = vignette;
      gCtx.fillRect(0, 0, bgGridCanvas.width, bgGridCanvas.height);
      gCtx.globalCompositeOperation = "source-over";
    }

    function buildAllPixels() {
      const totalCols1975 = getTotalCols1975();
      const totalColsCS = getTotalColsCS();
      const totalColsBY = getTotalColsBY();

      // Responsif HP & Desktop (pakai teks terlebar biar semua muat)
      const isMobile = canvas.width < 500;
      const maxColsWidth = canvas.width * (isMobile ? 0.94 : 0.84);
      const maxColsHeight = canvas.height * (isMobile ? 0.26 : 0.36);

      const baseSize = Math.min(
        maxColsWidth / totalColsCS,
        maxColsWidth / totalColsBY,
        maxColsHeight / 11
      );

      unifiedPixelSize = Math.max(3, Math.floor(baseSize));

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      let originX = cx % unifiedPixelSize;
      while (originX > 0) originX -= unifiedPixelSize;

      let originY = cy % unifiedPixelSize;
      while (originY > 0) originY -= unifiedPixelSize;

      // 1. Matriks 1975
      pixels1975 = [];
      const totalWidth1975 = totalCols1975 * unifiedPixelSize;
      const startX1975 =
        Math.round((cx - totalWidth1975 / 2 - originX) / unifiedPixelSize) *
          unifiedPixelSize +
        originX;
      const startY1975 =
        Math.round((cy - (11 * unifiedPixelSize) / 2 - originY) / unifiedPixelSize) *
          unifiedPixelSize +
        originY;

      // Kotak 3D gelap pembungkus teks 1975 (snap ke grid background)
      {
        const pad = unifiedPixelSize * 2;
        box1975 = {
          x: startX1975 - pad,
          y: startY1975 - pad,
          w: totalWidth1975 + pad * 2,
          h: 11 * unifiedPixelSize + pad * 2,
        };
      }

      let curX_1975 = startX1975;
      TEXT_1975.forEach((char) => {
        const matrix = GLYPHS_1975[char];
        const charW = matrix[0].length;
        for (let r = 0; r < 11; r++) {
          for (let c = 0; c < charW; c++) {
            if (matrix[r][c] === "█") {
              pixels1975.push({
                baseX: curX_1975 + c * unifiedPixelSize,
                baseY: startY1975 + r * unifiedPixelSize,
                appearTime: Math.random() * 0.76,
                disappearTime: Math.random() * 0.76,
                rgbColor:
                  RGB_PALETTE[Math.floor(Math.random() * RGB_PALETTE.length)],
              });
            }
          }
        }
        curX_1975 += (charW + 2) * unifiedPixelSize;
      });

      // 2. Matriks COMING SOON
      pixelsCS = [];
      const totalWidthCS = totalColsCS * unifiedPixelSize;
      const startXCS =
        Math.round((cx - totalWidthCS / 2 - originX) / unifiedPixelSize) *
          unifiedPixelSize +
        originX;
      const startYCS =
        Math.round((cy - (9 * unifiedPixelSize) / 2 - originY) / unifiedPixelSize) *
          unifiedPixelSize +
        originY;

      // Kotak 3D gelap pembungkus teks COMING SOON (snap ke grid background)
      {
        const pad = unifiedPixelSize * 2;
        boxCS = {
          x: startXCS - pad,
          y: startYCS - pad,
          w: totalWidthCS + pad * 2,
          h: 9 * unifiedPixelSize + pad * 2,
        };
      }

      let curX_CS = startXCS;
      TEXT_CS.forEach((char) => {
        const matrix = GLYPHS_CS[char];
        const charW = matrix[0].length;
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < charW; c++) {
            if (matrix[r][c] === "█") {
              pixelsCS.push({
                baseX: curX_CS + c * unifiedPixelSize,
                baseY: startYCS + r * unifiedPixelSize,
                appearTime: Math.random() * 0.76,
                disappearTime: Math.random() * 0.76,
                rgbColor:
                  RGB_PALETTE[Math.floor(Math.random() * RGB_PALETTE.length)],
              });
            }
          }
        }
        curX_CS += (charW + 1) * unifiedPixelSize;
      });

      // 3. Matriks BY FEMAANDARA (vertikal tengah, snap ke grid)
      pixelsBY = [];
      const totalWidthBY = totalColsBY * unifiedPixelSize;
      const startXBY =
        Math.round((cx - totalWidthBY / 2 - originX) / unifiedPixelSize) *
          unifiedPixelSize +
        originX;
      const startYBY =
        Math.round((cy - (9 * unifiedPixelSize) / 2 - originY) / unifiedPixelSize) *
          unifiedPixelSize +
        originY;

      // Kotak 3D gelap pembungkus teks BY (snap ke grid background)
      {
        const pad = unifiedPixelSize * 2;
        boxBY = {
          x: startXBY - pad,
          y: startYBY - pad,
          w: totalWidthBY + pad * 2,
          h: 9 * unifiedPixelSize + pad * 2,
        };
      }

      let curX_BY = startXBY;
      TEXT_BY.forEach((char) => {
        const matrix = GLYPHS_CS[char];
        const charW = matrix[0].length;
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < charW; c++) {
            if (matrix[r][c] === "█") {
              pixelsBY.push({
                baseX: curX_BY + c * unifiedPixelSize,
                baseY: startYBY + r * unifiedPixelSize,
                appearTime: Math.random() * 0.76,
                disappearTime: Math.random() * 0.76,
                rgbColor:
                  RGB_PALETTE[Math.floor(Math.random() * RGB_PALETTE.length)],
              });
            }
          }
        }
        curX_BY += (charW + 1) * unifiedPixelSize;
      });

      // 4. Tile Dinamis (3 KALI LEBIH BANYAK TILE 3D MENONJOL RGB: 14 * 3 = 42)
      dynamicTiles = [];
      for (let i = 0; i < 42; i++) {
        dynamicTiles.push(new DynamicTile("protruding"));
      }
      // Tile 3D mendalam abu-hitam
      for (let i = 0; i < 12; i++) {
        dynamicTiles.push(new DynamicTile("sunken"));
      }

      render3DSunkenBaseGrid(unifiedPixelSize, originX, originY);
    }

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      buildAllPixels();
    }

    const handleOrientation = () => setTimeout(resize, 150);
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", handleOrientation);

    // Klik/hover tombol pixel
    const inButton = (e: MouseEvent) => {
      if (!btnRect.visible) return false;
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      return (
        x >= btnRect.x &&
        x <= btnRect.x + btnRect.w &&
        y >= btnRect.y &&
        y <= btnRect.y + btnRect.h
      );
    };
    const onCanvasClick = (e: MouseEvent) => {
      if (inButton(e)) togglePlay();
    };
    const onCanvasMove = (e: MouseEvent) => {
      btnHover = inButton(e);
      canvas.style.cursor = btnHover ? "pointer" : "default";
    };
    canvas.addEventListener("click", onCanvasClick);
    canvas.addEventListener("mousemove", onCanvasMove);
    resize();

    // Gambar Piksel Teks
    function drawRgbPixel(x: number, y: number, size: number, color: string) {
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = size * 1.5;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, size, size);

      ctx.shadowBlur = size * 0.4;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, size, size);
      ctx.restore();
    }

    function drawWhiteGlowPixel(x: number, y: number, size: number) {
      ctx.save();
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = size * 1.8;
      ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
      ctx.fillRect(x, y, size, size);

      ctx.shadowBlur = size * 0.5;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, size, size);
      ctx.restore();
    }

    function drawRedGlowPixel(x: number, y: number, size: number) {
      ctx.save();
      ctx.shadowColor = "#ff0033";
      ctx.shadowBlur = size * 1.2;
      ctx.fillStyle = "#ff0033";
      ctx.fillRect(x, y, size, size);

      ctx.shadowBlur = size * 0.3;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, size, size);
      ctx.restore();
    }

    // --- Kotak pixel 3D gelap (pemetaan) di belakang teks ---
    // Grid dalam snap ke unifiedPixelSize + bevel sunken mirip grid dasar.
    // alpha = transisi fade, depthT = transisi extrude 0 (rata) -> 1 (penuh).
    function drawPixelBox(box: Box, alpha: number, depthT: number) {
      if (box.w <= 0 || box.h <= 0 || alpha <= 0.01) return;
      const step = unifiedPixelSize;
      const fullDx = Math.min(36, Math.max(14, box.w * 0.055));
      const fullDy = -Math.min(30, Math.max(12, box.h * 0.14));
      const dx = fullDx * depthT;
      const dy = fullDy * depthT;

      const fx0 = box.x;
      const fy0 = box.y;
      const fx1 = box.x + box.w;
      const fy1 = box.y + box.h;
      const bx0 = fx0 + dx;
      const by0 = fy0 + dy;
      const bx1 = fx1 + dx;
      const by1 = fy1 + dy;

      ctx.save();
      ctx.lineWidth = 1;

      // Wajah belakang gelap
      ctx.fillStyle = `rgba(10, 11, 18, ${(0.95 * alpha).toFixed(3)})`;
      ctx.fillRect(bx0, by0, box.w, box.h);

      // Dinding extrude atas & kanan
      ctx.fillStyle = `rgba(24, 25, 36, ${(0.9 * alpha).toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(fx0, fy0);
      ctx.lineTo(bx0, by0);
      ctx.lineTo(bx1, by0);
      ctx.lineTo(fx1, fy0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `rgba(18, 19, 28, ${(0.9 * alpha).toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(fx1, fy0);
      ctx.lineTo(bx1, by0);
      ctx.lineTo(bx1, by1);
      ctx.lineTo(fx1, fy1);
      ctx.closePath();
      ctx.fill();

      // Rusuk penghubung depan-belakang (garis pemetaan) — putih glow
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 8 * alpha;
      ctx.strokeStyle = `rgba(255, 255, 255, ${(0.4 * alpha).toFixed(3)})`;
      const corners: Array<[number, number, number, number]> = [
        [fx0, fy0, bx0, by0],
        [fx1, fy0, bx1, by0],
        [fx0, fy1, bx0, by1],
        [fx1, fy1, bx1, by1],
      ];
      corners.forEach(([x0, y0, x1, y1]) => {
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      });

      // Bingkai belakang — putih glow
      ctx.strokeStyle = `rgba(255, 255, 255, ${(0.3 * alpha).toFixed(3)})`;
      ctx.strokeRect(bx0, by0, box.w, box.h);
      ctx.shadowBlur = 0;

      // Badan depan gelap (pixel teks muncul dari atasnya)
      ctx.fillStyle = `rgba(3, 3, 7, ${(0.85 * alpha).toFixed(3)})`;
      ctx.fillRect(fx0, fy0, box.w, box.h);

      // Grid dalam selaras grid background + bevel sunken
      const darkA = `rgba(0, 0, 0, ${(0.9 * alpha).toFixed(3)})`;
      const lightA = `rgba(255, 255, 255, ${(0.07 * alpha).toFixed(3)})`;
      ctx.strokeStyle = darkA;
      for (let gx = fx0; gx <= fx1 + 0.5; gx += step) {
        ctx.beginPath();
        ctx.moveTo(gx, fy0);
        ctx.lineTo(gx, fy1);
        ctx.stroke();
      }
      for (let gy = fy0; gy <= fy1 + 0.5; gy += step) {
        ctx.beginPath();
        ctx.moveTo(fx0, gy);
        ctx.lineTo(fx1, gy);
        ctx.stroke();
      }
      ctx.strokeStyle = lightA;
      for (let gx = fx0 + 1; gx <= fx1 + 0.5; gx += step) {
        ctx.beginPath();
        ctx.moveTo(gx, fy0);
        ctx.lineTo(gx, fy1);
        ctx.stroke();
      }
      for (let gy = fy0 + 1; gy <= fy1 + 0.5; gy += step) {
        ctx.beginPath();
        ctx.moveTo(fx0, gy);
        ctx.lineTo(fx1, gy);
        ctx.stroke();
      }

      // Bingkai depan — putih glow
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 18 * alpha;
      ctx.strokeStyle = `rgba(255, 255, 255, ${(0.55 * alpha).toFixed(3)})`;
      ctx.strokeRect(fx0, fy0, box.w, box.h);
      ctx.shadowBlur = 0;

      ctx.restore();
    }

    // --- Tombol pixel PLAY/STOP (sel seukuran grid background) ---
    // Tiap sudut beda bentuk: TL coak 1, TR coak 2, BR coak L, BL full + tab.
    function drawPixelButton(
      bx: number,
      by: number,
      s: number,
      label: string[],
      labelCols: number,
      W: number,
      H: number
    ) {
      const hover = btnHover;

      // Isi gelap
      ctx.fillStyle = hover ? "rgba(12, 12, 22, 0.94)" : "rgba(4, 4, 8, 0.9)";
      ctx.fillRect(bx, by, W * s, H * s);

      // Bingkai putih glow (bolong di sudut unik)
      const skip = new Set([
        `0,0`,
        `${W - 1},0`,
        `${W - 2},0`,
        `${W - 1},${H - 1}`,
        `${W - 2},${H - 1}`,
        `${W - 1},${H - 2}`,
      ]);
      ctx.save();
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = hover ? 12 : 7;
      ctx.fillStyle = hover
        ? "rgba(255, 255, 255, 0.95)"
        : "rgba(255, 255, 255, 0.6)";
      for (let ix = 0; ix < W; ix++) {
        if (!skip.has(`${ix},0`)) ctx.fillRect(bx + ix * s, by, s, s);
        if (!skip.has(`${ix},${H - 1}`))
          ctx.fillRect(bx + ix * s, by + (H - 1) * s, s, s);
      }
      for (let iy = 1; iy < H - 1; iy++) {
        if (!skip.has(`0,${iy}`)) ctx.fillRect(bx, by + iy * s, s, s);
        if (!skip.has(`${W - 1},${iy}`))
          ctx.fillRect(bx + (W - 1) * s, by + iy * s, s, s);
      }
      ctx.restore();

      // Aksen cyan tiap sudut dalam + tab luar BL
      ctx.save();
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 6;
      ctx.fillStyle = "#00f0ff";
      ctx.fillRect(bx + s, by + s, s, s);
      ctx.fillRect(bx + (W - 2) * s, by + s, s, s);
      ctx.fillRect(bx + (W - 2) * s, by + (H - 2) * s, s, s);
      ctx.fillRect(bx + s, by + (H - 2) * s, s, s);
      ctx.fillRect(bx, by + H * s, s, s);
      ctx.restore();

      // Teks PLAY/STOP pixel, tengah rata
      const tx = bx + Math.floor((W - labelCols) / 2) * s;
      const ty = by + 2 * s;
      ctx.save();
      if (hover) {
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 8;
      }
      ctx.fillStyle = "#ffffff";
      let ox = tx;
      label.forEach((ch) => {
        const m = GLYPHS_CS[ch];
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < m[0].length; c++) {
            if (m[r][c] === "█") ctx.fillRect(ox + c * s, ty + r * s, s, s);
          }
        }
        ox += (m[0].length + 1) * s;
      });
      ctx.restore();
    }

    function render(timestamp: number) {
      if (!startTime) startTime = timestamp;
      if (!lastTimestamp) lastTimestamp = timestamp;
      const dt = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      const elapsed = (timestamp - startTime) % TOTAL_CYCLE;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Grid Dasar 3D Mendalam (Abu/Hitam)
      ctx.drawImage(bgGridCanvas, 0, 0);

      // 2. Tile 3D Acak (42 Tile Menonjol RGB + 12 Tile Cekung Abu-Hitam)
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxRadius = Math.max(canvas.width, canvas.height) * 0.58;
      let originX = cx % unifiedPixelSize;
      while (originX > 0) originX -= unifiedPixelSize;
      let originY = cy % unifiedPixelSize;
      while (originY > 0) originY -= unifiedPixelSize;

      dynamicTiles.forEach((tile) => {
        tile.update(dt);
        tile.draw(ctx, originX, originY, unifiedPixelSize, cx, cy, maxRadius);
      });

      // --- Kotak 3D: fade-in di 1975, DIAM selama teks padam, ---
      // --- morph HANYA pas jeda gelap, fade-out setelah BY selesai. ---
      {
        const lerpBox = (a: Box, b: Box, t: number): Box => {
          const e = t * t * (3 - 2 * t); // smoothstep biar melebarnya halus
          return {
            x: a.x + (b.x - a.x) * e,
            y: a.y + (b.y - a.y) * e,
            w: a.w + (b.w - a.w) * e,
            h: a.h + (b.h - a.h) * e,
          };
        };

        let morphBox: Box | null = null;
        let morphAlpha = 0;
        let morphDepth = 1;

        if (elapsed >= TIME_1975_START && elapsed < TIME_1975_HOLD) {
          const p = (elapsed - TIME_1975_START) / T_1975_APPEAR;
          morphBox = box1975;
          morphAlpha = Math.min(1, 0.15 + p * 1.5);
          morphDepth = Math.min(1, p * 1.4);
        } else if (elapsed >= TIME_1975_HOLD && elapsed < TIME_1975_END) {
          // Hold + vanish merah: box diam di ukuran 1975
          morphBox = box1975;
          morphAlpha = 1;
          morphDepth = 1;
        } else if (elapsed >= TIME_1975_END && elapsed < TIME_CS_START) {
          // Jeda gelap 1: teks lama sudah hilang total, baru morph.
          const t = Math.min(
            1,
            Math.max(0, (elapsed - TIME_1975_END) / (TIME_CS_START - TIME_1975_END))
          );
          morphBox = lerpBox(box1975, boxCS, t);
          morphAlpha = 1;
          morphDepth = 1;
        } else if (elapsed >= TIME_CS_START && elapsed < TIME_CS_END) {
          // Appear + hold + vanish merah CS: box diam di ukuran CS
          morphBox = boxCS;
          morphAlpha = 1;
          morphDepth = 1;
        } else if (elapsed >= TIME_CS_END && elapsed < TIME_BY_START) {
          // Jeda gelap 2: morph ke ukuran BY.
          const t = Math.min(
            1,
            Math.max(0, (elapsed - TIME_CS_END) / (TIME_BY_START - TIME_CS_END))
          );
          morphBox = lerpBox(boxCS, boxBY, t);
          morphAlpha = 1;
          morphDepth = 1;
        } else if (elapsed >= TIME_BY_START && elapsed < TIME_BY_VANISH) {
          morphBox = boxBY;
          morphAlpha = 1;
          morphDepth = 1;
        } else if (elapsed >= TIME_BY_VANISH && elapsed < TIME_BY_END) {
          const p = (elapsed - TIME_BY_VANISH) / T_BY_VANISH;
          morphBox = boxBY;
          morphAlpha = Math.max(0, 1 - p * 1.1);
          morphDepth = Math.max(0.25, 1 - p * 0.7);
        }

        if (morphBox) drawPixelBox(morphBox, morphAlpha, morphDepth);

        // --- Tombol pixel PLAY/STOP nempel di bawah box ---
        {
          const bs = unifiedPixelSize;
          if (morphBox && morphAlpha > 0.3) {
          const label = isPlaying ? TEXT_STOP : TEXT_PLAY;
          let labelCols = 0;
          label.forEach((ch, i) => {
            labelCols += GLYPHS_CS[ch][0].length;
            if (i < label.length - 1) labelCols += 1;
          });
          const cellsW = 37; // muat PLAY (29 kol) + padding, STOP ikut tengah
          const cellsH = 13;
          const bw = cellsW * bs;
          let bxo = cx % bs;
          while (bxo > 0) bxo -= bs;
          const bx =
            Math.round((cx - bw / 2 - bxo) / bs) * bs + bxo;
          const by = Math.round(morphBox.y + morphBox.h + 2 * bs);
          btnRect.x = bx;
          btnRect.y = by;
          btnRect.w = bw;
          btnRect.h = (cellsH + 1) * bs;
          btnRect.visible = true;
          drawPixelButton(bx, by, bs, label, labelCols, cellsW, cellsH);
          } else {
            btnRect.visible = false;
          }
        }
      }

      // =========================================================================
      // FASE 1: TEKS PIXEL "1975"
      // =========================================================================
      if (elapsed < TIME_1975_END) {
        // 1. Muncul RGB
        if (elapsed >= TIME_1975_START && elapsed < TIME_1975_HOLD) {
          const progress = (elapsed - TIME_1975_START) / T_1975_APPEAR;
          pixels1975.forEach((p) => {
            if (progress < p.appearTime) return;
            const timeSince = progress - p.appearTime;

            if (timeSince < 0.24) {
              if (Math.random() < 0.52) {
                const dynamicColor =
                  Math.random() < 0.35
                    ? RGB_PALETTE[Math.floor(Math.random() * RGB_PALETTE.length)]
                    : p.rgbColor;
                drawRgbPixel(p.baseX, p.baseY, unifiedPixelSize, dynamicColor);
              }
            } else {
              drawWhiteGlowPixel(p.baseX, p.baseY, unifiedPixelSize);
            }
          });
        }
        // 2. Diam Putih Glow
        else if (elapsed >= TIME_1975_HOLD && elapsed < TIME_1975_VANISH) {
          pixels1975.forEach((p) => {
            drawWhiteGlowPixel(p.baseX, p.baseY, unifiedPixelSize);
          });
        }
        // 3. Keluar Merah
        else if (elapsed >= TIME_1975_VANISH && elapsed < TIME_1975_END) {
          const progress = (elapsed - TIME_1975_VANISH) / T_1975_VANISH;
          pixels1975.forEach((p) => {
            if (progress > p.disappearTime + 0.24) return;
            if (progress > p.disappearTime) {
              if (Math.random() < 0.52) {
                drawRedGlowPixel(p.baseX, p.baseY, unifiedPixelSize);
              }
            } else {
              drawWhiteGlowPixel(p.baseX, p.baseY, unifiedPixelSize);
            }
          });
        }
      }

      // =========================================================================
      // FASE 2: TEKS PIXEL "COMING SOON" + SUBTEKS PIXEL TIPIS
      // =========================================================================
      else if (elapsed >= TIME_CS_START && elapsed < TIME_CS_END) {
        // 1. Muncul Pixel RGB
        if (elapsed < TIME_CS_HOLD) {
          const progress = (elapsed - TIME_CS_START) / T_CS_APPEAR;
          pixelsCS.forEach((p) => {
            if (progress < p.appearTime) return;
            const timeSince = progress - p.appearTime;

            if (timeSince < 0.24) {
              if (Math.random() < 0.52) {
                const dynamicColor =
                  Math.random() < 0.35
                    ? RGB_PALETTE[Math.floor(Math.random() * RGB_PALETTE.length)]
                    : p.rgbColor;
                drawRgbPixel(p.baseX, p.baseY, unifiedPixelSize, dynamicColor);
              }
            } else {
              drawWhiteGlowPixel(p.baseX, p.baseY, unifiedPixelSize);
            }
          });
        }
        // 2. Diam Putih Glow
        else if (elapsed >= TIME_CS_HOLD && elapsed < TIME_CS_VANISH) {
          pixelsCS.forEach((p) => {
            drawWhiteGlowPixel(p.baseX, p.baseY, unifiedPixelSize);
          });
        }
        // 3. Keluar KEDIP MERAH
        else if (elapsed >= TIME_CS_VANISH && elapsed < TIME_CS_END) {
          const progress = (elapsed - TIME_CS_VANISH) / T_CS_VANISH;

          pixelsCS.forEach((p) => {
            if (progress > p.disappearTime + 0.24) return;
            if (progress > p.disappearTime) {
              if (Math.random() < 0.52) {
                drawRedGlowPixel(p.baseX, p.baseY, unifiedPixelSize);
              }
            } else {
              drawWhiteGlowPixel(p.baseX, p.baseY, unifiedPixelSize);
            }
          });
        }
      }

      // =========================================================================
      // FASE 3: TEKS PIXEL "BY FEMAANDARA"
      // =========================================================================
      else if (elapsed >= TIME_BY_START && elapsed < TIME_BY_END) {
        // 1. Muncul RGB
        if (elapsed >= TIME_BY_START && elapsed < TIME_BY_HOLD) {
          const progress = (elapsed - TIME_BY_START) / T_BY_APPEAR;
          pixelsBY.forEach((p) => {
            if (progress < p.appearTime) return;
            const timeSince = progress - p.appearTime;

            if (timeSince < 0.24) {
              if (Math.random() < 0.52) {
                const dynamicColor =
                  Math.random() < 0.35
                    ? RGB_PALETTE[Math.floor(Math.random() * RGB_PALETTE.length)]
                    : p.rgbColor;
                drawRgbPixel(p.baseX, p.baseY, unifiedPixelSize, dynamicColor);
              }
            } else {
              drawWhiteGlowPixel(p.baseX, p.baseY, unifiedPixelSize);
            }
          });
        }
        // 2. Diam Putih Glow
        else if (elapsed >= TIME_BY_HOLD && elapsed < TIME_BY_VANISH) {
          pixelsBY.forEach((p) => {
            drawWhiteGlowPixel(p.baseX, p.baseY, unifiedPixelSize);
          });
        }
        // 3. Keluar Merah
        else if (elapsed >= TIME_BY_VANISH && elapsed < TIME_BY_END) {
          const progress = (elapsed - TIME_BY_VANISH) / T_BY_VANISH;
          pixelsBY.forEach((p) => {
            if (progress > p.disappearTime + 0.24) return;
            if (progress > p.disappearTime) {
              if (Math.random() < 0.52) {
                drawRedGlowPixel(p.baseX, p.baseY, unifiedPixelSize);
              }
            } else {
              drawWhiteGlowPixel(p.baseX, p.baseY, unifiedPixelSize);
            }
          });
        }
      }

      rafId = requestAnimationFrame(render);
    }

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", handleOrientation);
      canvas.removeEventListener("click", onCanvasClick);
      canvas.removeEventListener("mousemove", onCanvasMove);
      audio.pause();
    };
  }, []);

  return <canvas ref={canvasRef} className="stage-canvas" />;
}
