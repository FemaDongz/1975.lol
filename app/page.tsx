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

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const subCreditRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const subContainer = subContainerRef.current;
    const subCreditEl = subCreditRef.current;
    if (!canvas || !subContainer || !subCreditEl) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let pixelSize1975 = 10;
    let pixelSizeCS = 8;
    let pixels1975: Pixel[] = [];
    let pixelsCS: Pixel[] = [];

    type Box = { x: number; y: number; w: number; h: number };
    let box1975: Box = { x: 0, y: 0, w: 0, h: 0 };
    let boxCS: Box = { x: 0, y: 0, w: 0, h: 0 };

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
    let subtextTriggered = false;
    let rafId = 0;

    const subScrambler = new TextScrambler(subCreditEl);

    function buildAllPixels() {
      // 1. Matriks 1975
      pixels1975 = [];
      let totalCols1975 = 0;
      for (let i = 0; i < TEXT_1975.length; i++) {
        totalCols1975 += GLYPHS_1975[TEXT_1975[i]][0].length;
        if (i < TEXT_1975.length - 1) totalCols1975 += 2;
      }

      const baseSize1975 = Math.min(
        (canvas!.width * 0.72) / totalCols1975,
        (canvas!.height * 0.44) / 11
      );
      pixelSize1975 = Math.max(5, Math.floor(baseSize1975 * (2 / 3)));

      const totalWidth1975 = totalCols1975 * pixelSize1975;
      const startX1975 = Math.floor((canvas!.width - totalWidth1975) / 2);
      const startY1975 = Math.floor((canvas!.height - 11 * pixelSize1975) / 2);

      // Kotak 3D gelap pembungkus teks 1975 (pixel seolah muncul dari dalamnya)
      {
        const pad = pixelSize1975 * 2.2;
        box1975 = {
          x: startX1975 - pad,
          y: startY1975 - pad,
          w: totalWidth1975 + pad * 2,
          h: 11 * pixelSize1975 + pad * 2,
        };
      }

      let curX = startX1975;
      TEXT_1975.forEach((char) => {
        const matrix = GLYPHS_1975[char];
        const charW = matrix[0].length;
        for (let r = 0; r < 11; r++) {
          for (let c = 0; c < charW; c++) {
            if (matrix[r][c] === "█") {
              pixels1975.push({
                baseX: curX + c * pixelSize1975,
                baseY: startY1975 + r * pixelSize1975,
                appearTime: Math.random() * 0.76,
                disappearTime: Math.random() * 0.76,
                rgbColor:
                  RGB_PALETTE[Math.floor(Math.random() * RGB_PALETTE.length)],
              });
            }
          }
        }
        curX += (charW + 2) * pixelSize1975;
      });

      // 2. Matriks COMING SOON
      pixelsCS = [];
      let totalColsCS = 0;
      for (let i = 0; i < TEXT_CS.length; i++) {
        totalColsCS += GLYPHS_CS[TEXT_CS[i]][0].length;
        if (i < TEXT_CS.length - 1) totalColsCS += 1;
      }

      const baseSizeCS = Math.min(
        (canvas!.width * 0.82) / totalColsCS,
        (canvas!.height * 0.28) / 9
      );
      pixelSizeCS = Math.max(4, Math.floor(baseSizeCS));

      const totalWidthCS = totalColsCS * pixelSizeCS;
      const startXCS = Math.floor((canvas!.width - totalWidthCS) / 2);
      const startYCS = Math.floor(canvas!.height / 2 - (9 * pixelSizeCS) / 2 - 25);

      // Kotak 3D gelap pembungkus teks COMING SOON
      {
        const pad = pixelSizeCS * 2.2;
        boxCS = {
          x: startXCS - pad,
          y: startYCS - pad,
          w: totalWidthCS + pad * 2,
          h: 9 * pixelSizeCS + pad * 2,
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
                baseX: curX_CS + c * pixelSizeCS,
                baseY: startYCS + r * pixelSizeCS,
                appearTime: Math.random() * 0.76,
                disappearTime: Math.random() * 0.76,
                rgbColor:
                  RGB_PALETTE[Math.floor(Math.random() * RGB_PALETTE.length)],
              });
            }
          }
        }
        curX_CS += (charW + 1) * pixelSizeCS;
      });

      const subY = startYCS + 9 * pixelSizeCS + 28;
      subContainer!.style.top = `${subY}px`;
    }

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      buildAllPixels();
    }

    window.addEventListener("resize", resize);
    resize();

    function drawRgbPixel(x: number, y: number, size: number, color: string) {
      ctx!.save();
      ctx!.shadowColor = color;
      ctx!.shadowBlur = size * 1.5;
      ctx!.fillStyle = color;
      ctx!.fillRect(x, y, size, size);

      ctx!.shadowBlur = size * 0.4;
      ctx!.fillStyle = "#ffffff";
      ctx!.fillRect(x, y, size, size);
      ctx!.restore();
    }

    function drawWhiteGlowPixel(x: number, y: number, size: number) {
      ctx!.save();
      ctx!.shadowColor = "#ffffff";
      ctx!.shadowBlur = size * 1.8;
      ctx!.fillStyle = "rgba(255, 255, 255, 0.65)";
      ctx!.fillRect(x, y, size, size);

      ctx!.shadowBlur = size * 0.5;
      ctx!.fillStyle = "#ffffff";
      ctx!.fillRect(x, y, size, size);
      ctx!.restore();
    }

    function drawRedGlowPixel(x: number, y: number, size: number) {
      ctx!.save();
      ctx!.shadowColor = "#ff0033";
      ctx!.shadowBlur = size * 1.2;
      ctx!.fillStyle = "#ff0033";
      ctx!.fillRect(x, y, size, size);

      ctx!.shadowBlur = size * 0.3;
      ctx!.fillStyle = "#ffffff";
      ctx!.fillRect(x, y, size, size);
      ctx!.restore();
    }

    // --- Kotak pixel 3D gelap (pemetaan) di belakang teks ---
    // Pixel seolah muncul dari dalam box ini.
    function drawPixelBox(box: Box, alphaScale = 1) {
      if (box.w <= 0 || box.h <= 0) return;
      const dx = Math.min(36, Math.max(14, box.w * 0.055));
      const dy = -Math.min(30, Math.max(12, box.h * 0.14));

      const fx0 = box.x;
      const fy0 = box.y;
      const fx1 = box.x + box.w;
      const fy1 = box.y + box.h;
      const bx0 = fx0 + dx;
      const by0 = fy0 + dy;
      const bx1 = fx1 + dx;
      const by1 = fy1 + dy;

      ctx!.save();
      ctx!.lineWidth = 1;

      // Sisi belakang (lebih terang sedikit biar berasa dalam)
      ctx!.fillStyle = `rgba(16, 16, 24, ${(0.95 * alphaScale).toFixed(3)})`;
      ctx!.fillRect(bx0, by0, box.w, box.h);

      // Dinding sisi: atas & kanan (efek extrude 3D)
      ctx!.fillStyle = `rgba(26, 26, 38, ${(0.9 * alphaScale).toFixed(3)})`;
      ctx!.beginPath();
      ctx!.moveTo(fx0, fy0);
      ctx!.lineTo(bx0, by0);
      ctx!.lineTo(bx1, by0);
      ctx!.lineTo(fx1, fy0);
      ctx!.closePath();
      ctx!.fill();
      ctx!.fillStyle = `rgba(20, 20, 30, ${(0.9 * alphaScale).toFixed(3)})`;
      ctx!.beginPath();
      ctx!.moveTo(fx1, fy0);
      ctx!.lineTo(bx1, by0);
      ctx!.lineTo(bx1, by1);
      ctx!.lineTo(fx1, fy1);
      ctx!.closePath();
      ctx!.fill();

      // Rusuk penghubung depan-belakang (garis pemetaan)
      ctx!.strokeStyle = `rgba(255, 255, 255, ${(0.18 * alphaScale).toFixed(3)})`;
      const corners: Array<[number, number, number, number]> = [
        [fx0, fy0, bx0, by0],
        [fx1, fy0, bx1, by0],
        [fx0, fy1, bx0, by1],
        [fx1, fy1, bx1, by1],
      ];
      corners.forEach(([x0, y0, x1, y1]) => {
        ctx!.beginPath();
        ctx!.moveTo(x0, y0);
        ctx!.lineTo(x1, y1);
        ctx!.stroke();
      });

      // Bingkai belakang
      ctx!.strokeStyle = `rgba(255, 255, 255, ${(0.12 * alphaScale).toFixed(3)})`;
      ctx!.strokeRect(bx0, by0, box.w, box.h);

      // Badan depan gelap (tempat pixel muncul)
      ctx!.fillStyle = `rgba(4, 4, 8, ${(0.82 * alphaScale).toFixed(3)})`;
      ctx!.fillRect(fx0, fy0, box.w, box.h);

      // Grid pemetaan samar di dalam box
      const step = Math.max(18, Math.floor(box.w / 24));
      ctx!.strokeStyle = `rgba(255, 255, 255, ${(0.05 * alphaScale).toFixed(3)})`;
      for (let gx = fx0 + step; gx < fx1; gx += step) {
        ctx!.beginPath();
        ctx!.moveTo(gx, fy0);
        ctx!.lineTo(gx, fy1);
        ctx!.stroke();
      }
      for (let gy = fy0 + step; gy < fy1; gy += step) {
        ctx!.beginPath();
        ctx!.moveTo(fx0, gy);
        ctx!.lineTo(fx1, gy);
        ctx!.stroke();
      }

      // Bingkai depan + glow tipis
      ctx!.shadowColor = "#ffffff";
      ctx!.shadowBlur = 10 * alphaScale;
      ctx!.strokeStyle = `rgba(255, 255, 255, ${(0.28 * alphaScale).toFixed(3)})`;
      ctx!.strokeRect(fx0, fy0, box.w, box.h);
      ctx!.shadowBlur = 0;

      ctx!.restore();
    }

    // --- Vignette: gelapkan pinggiran layar ---
    function drawVignette() {
      const W = canvas!.width;
      const H = canvas!.height;
      const g = ctx!.createRadialGradient(
        W / 2,
        H / 2,
        Math.min(W, H) * 0.32,
        W / 2,
        H / 2,
        Math.max(W, H) * 0.72
      );
      g.addColorStop(0, "rgba(0, 0, 0, 0)");
      g.addColorStop(0.6, "rgba(0, 0, 0, 0.28)");
      g.addColorStop(1, "rgba(0, 0, 0, 0.78)");
      ctx!.save();
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, W, H);
      ctx!.restore();
    }

    function render(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) % TOTAL_CYCLE;

      ctx!.fillStyle = "#000000";
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);

      if (elapsed < TIME_1975_END) {
        subContainer!.classList.remove("active");
        subCreditEl!.classList.remove("vanishing-red");
        subCreditEl!.style.opacity = "1";
        subtextTriggered = false;

        if (elapsed >= TIME_1975_START && elapsed < TIME_1975_HOLD) {
          const progress = (elapsed - TIME_1975_START) / T_1975_APPEAR;
          // Box memudar masuk duluan, pixel muncul dari dalamnya
          drawPixelBox(box1975, Math.min(1, 0.2 + progress * 1.4));
          pixels1975.forEach((p) => {
            if (progress < p.appearTime) return;
            const timeSince = progress - p.appearTime;

            if (timeSince < 0.24) {
              if (Math.random() < 0.52) {
                const dynamicColor =
                  Math.random() < 0.35
                    ? RGB_PALETTE[Math.floor(Math.random() * RGB_PALETTE.length)]
                    : p.rgbColor;
                drawRgbPixel(p.baseX, p.baseY, pixelSize1975, dynamicColor);
              }
            } else {
              drawWhiteGlowPixel(p.baseX, p.baseY, pixelSize1975);
            }
          });
        } else if (elapsed >= TIME_1975_HOLD && elapsed < TIME_1975_VANISH) {
          drawPixelBox(box1975, 1);
          pixels1975.forEach((p) => {
            drawWhiteGlowPixel(p.baseX, p.baseY, pixelSize1975);
          });
        } else if (elapsed >= TIME_1975_VANISH && elapsed < TIME_1975_END) {
          const progress = (elapsed - TIME_1975_VANISH) / T_1975_VANISH;
          drawPixelBox(box1975, Math.max(0.25, 1 - progress * 0.6));
          pixels1975.forEach((p) => {
            if (progress > p.disappearTime + 0.24) return;
            if (progress > p.disappearTime) {
              if (Math.random() < 0.52) {
                drawRedGlowPixel(p.baseX, p.baseY, pixelSize1975);
              }
            } else {
              drawWhiteGlowPixel(p.baseX, p.baseY, pixelSize1975);
            }
          });
        }
      } else if (elapsed >= TIME_CS_START && elapsed < TIME_CS_END) {
        if (elapsed < TIME_CS_HOLD) {
          subCreditEl!.classList.remove("vanishing-red");
          subCreditEl!.style.opacity = "1";

          const progress = (elapsed - TIME_CS_START) / T_CS_APPEAR;
          drawPixelBox(boxCS, Math.min(1, 0.2 + progress * 1.4));
          pixelsCS.forEach((p) => {
            if (progress < p.appearTime) return;
            const timeSince = progress - p.appearTime;

            if (timeSince < 0.24) {
              if (Math.random() < 0.52) {
                const dynamicColor =
                  Math.random() < 0.35
                    ? RGB_PALETTE[Math.floor(Math.random() * RGB_PALETTE.length)]
                    : p.rgbColor;
                drawRgbPixel(p.baseX, p.baseY, pixelSizeCS, dynamicColor);
              }
            } else {
              drawWhiteGlowPixel(p.baseX, p.baseY, pixelSizeCS);
            }
          });

          if (progress > 0.65 && !subtextTriggered) {
            subtextTriggered = true;
            subContainer!.classList.add("active");
            subScrambler.start("1975.lol owned by femaandara", 2.2, 5);
          }
        } else if (elapsed >= TIME_CS_HOLD && elapsed < TIME_CS_VANISH) {
          drawPixelBox(boxCS, 1);
          pixelsCS.forEach((p) => {
            drawWhiteGlowPixel(p.baseX, p.baseY, pixelSizeCS);
          });
        } else if (elapsed >= TIME_CS_VANISH && elapsed < TIME_CS_END) {
          const progress = (elapsed - TIME_CS_VANISH) / T_CS_VANISH;

          drawPixelBox(boxCS, Math.max(0.25, 1 - progress * 0.6));
          pixelsCS.forEach((p) => {
            if (progress > p.disappearTime + 0.24) return;
            if (progress > p.disappearTime) {
              if (Math.random() < 0.52) {
                drawRedGlowPixel(p.baseX, p.baseY, pixelSizeCS);
              }
            } else {
              drawWhiteGlowPixel(p.baseX, p.baseY, pixelSizeCS);
            }
          });

          subCreditEl!.classList.add("vanishing-red");
          if (Math.random() < 0.42) {
            subCreditEl!.style.opacity = "0";
          } else {
            subCreditEl!.style.opacity = String(Math.max(0, 1 - progress * 1.25));
          }
        }

        subScrambler.update();
      } else {
        subContainer!.classList.remove("active");
      }

      // Vignette di atas segalanya
      drawVignette();

      rafId = requestAnimationFrame(render);
    }

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
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
