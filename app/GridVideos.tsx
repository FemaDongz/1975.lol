"use client";

import { useEffect, useRef, useState } from "react";

// Video lokal di sel grid background. Kolom & jumlah slot menyesuaikan
// ukuran layar (mobile: kolom lebih sedikit, slot lebih sedikit). Tiap slot
// fade-out → pindah sel (tidak sama / bersebelahan) + ganti file → fade-in,
// terus-menerus. Saturasi 0, vignette per-sel, muted autoplay.
//
// Ganti/isi FILES dengan video di public/videos/.

const FILES = [
  "s1.mp4", "s2.mp4", "s3.mp4", "s4.mp4", "s5.mp4",
  "s6.mp4", "s7.mp4", "s8.mp4", "s9.mp4", "s10.mp4",
];

// 7 kolom desktop, 5 kolom mobile (proporsi grid shader menyesuaikan).
const COLS_DESKTOP = 7;
const COLS_MOBILE = 5;
const MOBILE_MAX = 640;

const SHOW_MS = 5000;
const FADE_MS = 800;

const rand = (n: number) => Math.floor(Math.random() * n);
type Cell = { c: number; r: number };

export default function GridVideos() {
  const rootRef = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  const [geo, setGeo] = useState({ H: 0, cell: 0, rows: 0, cols: COLS_DESKTOP, slots: 3 });
  const geoRef = useRef(geo);
  geoRef.current = geo;
  const [slots, setSlots] = useState<{ pos: Cell; file: string; vis: number; cyc: number }[]>([]);

  // ukur grid + tentukan kolom & jumlah slot adaptif
  useEffect(() => {
    const parent = rootRef.current?.parentElement;
    if (!parent) return;
    const measure = () => {
      const W = parent.clientWidth;
      const H = parent.clientHeight;
      if (!W || !H) return;
      const mobile = W < MOBILE_MAX;
      const cols = mobile ? COLS_MOBILE : COLS_DESKTOP;
      const cell = W / cols;
      const rows = Math.max(2, 2 * Math.round(H / cell / 2));
      // banyak sel -> lebih banyak slot (mobile dibatasi biar ringan)
      const maxSlots = mobile ? 3 : 5;
      const slots = Math.max(2, Math.min(maxSlots, Math.floor((cols * rows) / 8)));
      setGeo({ H, cell, rows, cols, slots });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // init slot saat ukuran berubah
  useEffect(() => {
    if (!geo.rows || !geo.slots) return;
    const init: Cell[] = [];
    const arr = Array.from({ length: geo.slots }).map(() => {
      const c = rand(geo.cols);
      const r = rand(geo.rows);
      const p = { c, r };
      init.push(p);
      return { pos: p, file: FILES[rand(FILES.length)], vis: 0, cyc: -1 };
    });
    setSlots(arr);
    refs.current = new Array(geo.slots).fill(null);
  }, [geo.rows, geo.cols, geo.slots]);

  const pickCell = (used: Cell[]): Cell => {
    const { cols, rows } = geoRef.current;
    for (let t = 0; t < 60; t++) {
      const c = rand(cols);
      const r = rand(rows);
      const clash = used.some(
        (u) =>
          (u.c === c && u.r === r) ||
          Math.abs(u.c - c) + Math.abs(u.r - r) === 1
      );
      if (!clash) return { c, r };
    }
    return { c: rand(cols), r: rand(rows) };
  };

  // siklus animasi: pakai interval (bukan rAF) biar hemat CPU
  useEffect(() => {
    if (slots.length !== geo.slots || !geo.slots) return;
    const step = () => {
      setSlots((prev) => {
        if (prev.length !== geoRef.current.slots) return prev;
        const now = Date.now();
        const next = prev.map((s, i) => {
          const phaseStart = s.cyc < 0 ? now : s.cyc;
          const elapsed = now - phaseStart;
          const vis = elapsed < SHOW_MS - FADE_MS ? 1 : elapsed < SHOW_MS ? 0 : 0;
          if (elapsed >= SHOW_MS) {
            const others = prev.filter((_, k) => k !== i).map((x) => x.pos);
            const np = pickCell(others);
            return {
              pos: np,
              file: FILES[rand(FILES.length)],
              vis: 0,
              cyc: now,
            };
          }
          return s.vis !== vis ? { ...s, vis } : s;
        });
        return next;
      });
    };
    const id = setInterval(step, 260);
    return () => clearInterval(id);
  }, [slots.length, geo.slots]);

  // play video saat muncul
  useEffect(() => {
    slots.forEach((s, i) => {
      if (s.vis > 0.5) refs.current[i]?.play().catch(() => {});
    });
  }, [slots]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}
    >
      {geo.cell > 0 &&
        slots.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.pos.c * geo.cell,
              top: geo.H / 2 - (geo.rows * geo.cell) / 2 + s.pos.r * geo.cell,
              width: geo.cell,
              height: geo.cell,
              opacity: s.vis,
              transition: `opacity ${FADE_MS}ms ease`,
              filter: "saturate(0)",
              pointerEvents: "none",
            }}
          >
            <video
              ref={(el) => {
                refs.current[i] = el;
              }}
              src={`/videos/${s.file}`}
              muted
              loop
              playsInline
              autoPlay
              preload="none"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            {/* vignette kotak sesuai grid */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(130% 130% at 50% 50%, transparent 45%, rgba(0,0,0,.35) 78%, rgba(0,0,0,.85) 100%)",
                pointerEvents: "none",
              }}
            />
          </div>
        ))}
    </div>
  );
}
