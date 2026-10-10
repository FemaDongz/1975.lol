"use client";

import { useEffect, useRef, useState } from "react";

// 5 slot video di sel grid shader (kolom = cols, samain shader).
// CACHE PINTAR: tiap video dicek/di-preload dulu (fetch + decode singkat).
// Slot baru ditampilkan setelah videonya siap (readyState >= 2), jadi tidak
// ada "hitam"/putus. Hasil pengecekan dicache agar tidak diulang.
// Tiap slot siklus sendiri (fase beda), fade-out → pindah sel + ganti file
// → fade-in, berulang. Saturasi 0 + vignette per-sel, muted autoplay.

const FILES = [
  "s1.mp4", "s2.mp4", "s3.mp4", "s4.mp4", "s5.mp4",
  "s6.mp4", "s7.mp4", "s8.mp4", "s9.mp4", "s10.mp4",
];

const SLOTS = 5;
const SHOW_MS = 5000;
const FADE_MS = 800;

const rand = (n: number) => Math.floor(Math.random() * n);
type Cell = { c: number; r: number };
type Slot = { pos: Cell; file: string; vis: number; born: number };

// ---- cache pintar: status siap tiap file ----
const readyCache = new Map<string, boolean>();
const preloadPromise = new Map<string, Promise<boolean>>();

function preloadVideo(file: string): Promise<boolean> {
  if (readyCache.has(file)) return Promise.resolve(readyCache.get(file)!);
  const exist = preloadPromise.get(file);
  if (exist) return exist;
  const p = new Promise<boolean>((resolve) => {
    const v = document.createElement("video");
    v.muted = true;
    v.preload = "auto";
    v.src = `/videos/${file}`;
    const ok = () => {
      readyCache.set(file, true);
      resolve(true);
      v.removeAttribute("src");
    };
    const bad = () => {
      readyCache.set(file, false);
      resolve(false);
    };
    v.addEventListener("canplaythrough", ok, { once: true });
    v.addEventListener("loadeddata", ok, { once: true });
    v.addEventListener("error", bad, { once: true });
    // fallback timeout biar tidak menggantung
    setTimeout(() => {
      if (!readyCache.has(file)) {
        readyCache.set(file, true);
        resolve(true);
      }
    }, 4000);
    v.load();
  });
  preloadPromise.set(file, p);
  return p;
}

export default function GridVideos({ cols = 7 }: { cols?: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState({ H: 0, cell: 0, rows: 0 });
  const geoRef = useRef(geo);
  geoRef.current = geo;
  const [slots, setSlots] = useState<Slot[]>([]);

  // warm-up cache semua video di awal
  useEffect(() => {
    FILES.forEach((f) => preloadVideo(f));
  }, []);

  useEffect(() => {
    const parent = rootRef.current?.parentElement;
    if (!parent) return;
    const measure = () => {
      const W = parent.clientWidth;
      const H = parent.clientHeight;
      if (!W || !H) return;
      const cell = W / cols;
      const rows = Math.max(2, 2 * Math.round(H / cell / 2));
      setGeo({ H, cell, rows });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [cols]);

  const pickCell = (used: Cell[]): Cell => {
    const rows = geoRef.current.rows || 2;
    for (let t = 0; t < 80; t++) {
      const c = rand(cols);
      const r = rand(rows);
      const clash = used.some(
        (u) =>
          (u.c === c && u.r === r) || Math.abs(u.c - c) + Math.abs(u.r - r) === 1
      );
      if (!clash) return { c, r };
    }
    return { c: rand(cols), r: rand(rows) };
  };

  const pickFile = (used: string[]): string => {
    // utamakan file yang sudah siap (dari cache)
    const free = FILES.filter((f) => !used.includes(f));
    const pool = free.length ? free : FILES;
    const ready = pool.filter((f) => readyCache.get(f) === true);
    const pick = ready.length ? ready : pool;
    return pick[rand(pick.length)];
  };

  // init 5 slot setelah video siap (check dulu)
  useEffect(() => {
    if (!geo.rows || slots.length) return;
    let alive = true;
    Promise.all(FILES.map((f) => preloadVideo(f))).then(() => {
      if (!alive || geoRef.current.rows === 0) return;
      const used: Cell[] = [];
      const usedFiles: string[] = [];
      const now = performance.now();
      const arr: Slot[] = [];
      for (let i = 0; i < SLOTS; i++) {
        const p = pickCell(used);
        used.push(p);
        const f = pickFile(usedFiles);
        usedFiles.push(f);
        arr.push({
          pos: p,
          file: f,
          vis: 1,
          born: now - Math.floor((SHOW_MS / SLOTS) * i),
        });
      }
      setSlots(arr);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.rows, slots.length]);

  // siklus tiap slot
  useEffect(() => {
    if (slots.length !== SLOTS) return;
    const id = setInterval(() => {
      const now = performance.now();
      setSlots((prev) => {
        let changed = false;
        const next = prev.map((s, i) => {
          const age = now - s.born;
          const vis = age < SHOW_MS - FADE_MS ? 1 : 0;
          if (age >= SHOW_MS) {
            const others = prev.filter((_, k) => k !== i).map((x) => x.pos);
            const othersFiles = prev
              .filter((_, k) => k !== i)
              .map((x) => x.file);
            changed = true;
            return {
              pos: pickCell(others),
              file: pickFile(othersFiles),
              vis: 0,
              born: now,
            };
          }
          if (s.vis !== vis) {
            changed = true;
            return { ...s, vis };
          }
          return s;
        });
        return changed ? next : prev;
      });
    }, 200);
    return () => clearInterval(id);
  }, [slots.length]);

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
              src={`/videos/${s.file}`}
              muted
              loop
              playsInline
              autoPlay
              preload="auto"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
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
