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
  " ": ["   ", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "   "],
};

const TEXT_1975 = ["1", "9", "7", "5"];
const TEXT_CS = ["C", "O", "M", "I", "N", "G", " ", "S", "O", "O", "N"];

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

type QueueItem = {
  to: string;
  start: number;
  end: number;
  char: string;
};

// --- DECRYPTOR SUBTEKS PIXEL ---
class TextScrambler {
  el: HTMLElement;
  chars: string;
  queue: QueueItem[];
  frame: number;
  running: boolean;

  constructor(el: HTMLElement, chars = "0123456789abcdefghijklmnopqrstuvwxyz._/!<>*&") {
    this.el = el;
    this.chars = chars;
    this.queue = [];
    this.frame = 0;
    this.running = false;
  }

  start(targetText: string, speed = 2.4, delayPerWord = 6) {
    this.queue = [];
    let currentDelay = 0;
    const words = targetText.split(" ");

    words.forEach((word) => {
      for (let i = 0; i < word.length; i++) {
        const to = word[i];
        const start = Math.floor(currentDelay + i * (2.8 / speed));
        const end = start + Math.floor(7 / speed);
        this.queue.push({ to, start, end, char: "" });
      }
      this.queue.push({ to: " ", start: 0, end: 0, char: " " });
      currentDelay += delayPerWord;
    });

    if (this.queue.length > 0 && this.queue[this.queue.length - 1].to === " ") {
      this.queue.pop();
    }

    this.frame = 0;
    this.running = true;
  }

  update() {
    if (!this.running) return;

    let output = "";
    let complete = 0;

    for (let i = 0; i < this.queue.length; i++) {
      const item = this.queue[i];

      if (item.to === " ") {
        output += " ";
        complete++;
        continue;
      }

      if (this.frame >= item.end) {
        complete++;
        output += item.to;
      } else if (this.frame >= item.start) {
        if (!item.char || Math.random() < 0.35) {
          item.char = this.chars[Math.floor(Math.random() * this.chars.length)];
        }
        output += `<span class="decrypting">${item.char}</span>`;
      } else {
        output += "";
      }
    }

    this.el.innerHTML = output;
    this.frame++;

    if (complete === this.queue.length) {
      this.running = false;
    }
  }
}

type TileType = "protruding" | "sunken";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const subCreditRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const subContainerEl = subContainerRef.current;
    const subCreditEl0 = subCreditRef.current;
    if (!canvasEl || !subContainerEl || !subCreditEl0) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const subContainer: HTMLDivElement = subContainerEl;
    const subCreditEl: HTMLDivElement = subCreditEl0;
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;

    const bgGridCanvas = document.createElement("canvas");

    let unifiedPixelSize = 8;
    let pixels1975: Pixel[] = [];
    let pixelsCS: Pixel[] = [];

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
    const T_GAP_1 = 700;
    const T_CS_APPEAR = 1900;
    const T_CS_HOLD = 3800;
    const T_CS_VANISH = 1800;
    const T_END_DELAY = 1200;

    const TIME_1975_START = T_INITIAL_DELAY;
    const TIME_1975_HOLD = TIME_1975_START + T_1975_APPEAR;
    const TIME_1975_VANISH = TIME_1975_HOLD + T_1975_HOLD;
    const TIME_1975_END = TIME_1975_VANISH + T_1975_VANISH;

    const TIME_CS_START = TIME_1975_END + T_GAP_1;
    const TIME_CS_HOLD = TIME_CS_START + T_CS_APPEAR;
    const TIME_CS_VANISH = TIME_CS_HOLD + T_CS_HOLD;
    const TIME_CS_END = TIME_CS_VANISH + T_CS_VANISH;

    const TOTAL_CYCLE = TIME_CS_END + T_END_DELAY;

    let startTime: number | null = null;
    let lastTimestamp = 0;
    let subtextTriggered = false;
    let rafId = 0;

    const subScrambler = new TextScrambler(subCreditEl);

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

      // Responsif HP & Desktop
      const isMobile = canvas.width < 500;
      const maxColsWidth = canvas.width * (isMobile ? 0.94 : 0.84);
      const maxColsHeight = canvas.height * (isMobile ? 0.26 : 0.36);

      const baseSize = Math.min(maxColsWidth / totalColsCS, maxColsHeight / 11);

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
      const yOffsetCS = isMobile ? 18 : 26;
      const startYCS =
        Math.round(
          (cy - (9 * unifiedPixelSize) / 2 - yOffsetCS - originY) / unifiedPixelSize
        ) *
          unifiedPixelSize +
        originY;

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

      // Posisikan Subteks
      const subY = startYCS + 9 * unifiedPixelSize + (isMobile ? 18 : 24);
      subContainer.style.top = `${subY}px`;

      // 3. Tile Dinamis (3 KALI LEBIH BANYAK TILE 3D MENONJOL RGB: 14 * 3 = 42)
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

      // =========================================================================
      // FASE 1: TEKS PIXEL "1975"
      // =========================================================================
      if (elapsed < TIME_1975_END) {
        subContainer.classList.remove("active");
        subCreditEl.classList.remove("vanishing-red");
        subCreditEl.style.opacity = "1";
        subtextTriggered = false;

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
          subCreditEl.classList.remove("vanishing-red");
          subCreditEl.style.opacity = "1";

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

          // Mulai dekripsi subteks pixel tipis
          if (progress > 0.65 && !subtextTriggered) {
            subtextTriggered = true;
            subContainer.classList.add("active");
            subScrambler.start("1975.lol owned by femaandara", 2.2, 5);
          }
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

          subCreditEl.classList.add("vanishing-red");
          if (Math.random() < 0.42) {
            subCreditEl.style.opacity = "0";
          } else {
            subCreditEl.style.opacity = String(Math.max(0, 1 - progress * 1.25));
          }
        }

        subScrambler.update();
      } else {
        subContainer.classList.remove("active");
      }

      rafId = requestAnimationFrame(render);
    }

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", handleOrientation);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="stage-canvas" />
      <div ref={subContainerRef} className="subtext-container">
        <div ref={subCreditRef} className="sub-credit" />
      </div>
    </>
  );
}
