"use client";

import { useEffect, useRef, useState } from "react";

// Video lokal (repo + CDN jsDelivr) tampil pas di 1 sel grid background
// (7 kolom, baris terpusat seperti shader): tiap 5 detik fade-out,
// pindah sel random + ganti file, fade-in. Saturasi 20%, muted autoplay.
//
// Ganti FILES dengan video kamu (taruh di public/videos/).

const FILES = ["v1.mp4", "v2.mp4", "v3.mp4", "v4.mp4", "v5.mp4"];
const CDN = "https://cdn.jsdelivr.net/gh/FemaDongz/1975.lol@main/public/videos";

const COLS = 7;
const SHOW_MS = 5000;
const FADE_MS = 800;

export default function GridVideos() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [geom, setGeom] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [file, setFile] = useState(FILES[0]);
  const [useLocal, setUseLocal] = useState(false);
  const [vis, setVis] = useState(0);

  const src = useLocal ? `/videos/${file}` : `${CDN}/${file}`;

  // Ukur sel grid dari container induk (samain shader: 7 kolom, baris terpusat)
  useEffect(() => {
    const parent = videoRef.current?.parentElement?.parentElement;
    const target = parent ?? undefined;
    if (!target) return;
    const measure = () => {
      const W = target.clientWidth;
      const H = target.clientHeight;
      if (!W || !H) return;
      const cell = W / COLS;
      const rows = Math.max(1, Math.round(H / cell));
      setGeom({
        x: Math.round(Math.floor(Math.random() * COLS) * cell),
        y: Math.round(H / 2 - (rows * cell) / 2 + Math.floor(Math.random() * rows) * cell),
        w: Math.round(cell),
        h: Math.round(cell),
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Siklus 5 detik: fade-out -> pindah sel + ganti file -> fade-in
  useEffect(() => {
    if (!geom.w) return;
    const tIn = setTimeout(() => {
      setVis(1);
      videoRef.current?.play().catch(() => {});
    }, 60);
    const tSwap = setTimeout(() => setVis(0), SHOW_MS - FADE_MS);
    const tNext = setTimeout(() => {
      const parent = videoRef.current?.parentElement?.parentElement;
      if (parent) {
        const W = parent.clientWidth;
        const H = parent.clientHeight;
        const cell = W / COLS;
        const rows = Math.max(1, Math.round(H / cell));
        setGeom({
          x: Math.round(Math.floor(Math.random() * COLS) * cell),
          y: Math.round(
            H / 2 - (rows * cell) / 2 + Math.floor(Math.random() * rows) * cell
          ),
          w: Math.round(cell),
          h: Math.round(cell),
        });
      }
      setFile(FILES[Math.floor(Math.random() * FILES.length)]);
    }, SHOW_MS);
    return () => {
      clearTimeout(tIn);
      clearTimeout(tSwap);
      clearTimeout(tNext);
    };
  }, [geom.w, file]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: geom.x,
        top: geom.y,
        width: geom.w,
        height: geom.h,
        zIndex: 1,
        overflow: "hidden",
        borderRadius: 3,
        opacity: vis,
        filter: "saturate(0.2)",
        transition: `opacity ${FADE_MS}ms ease`,
        pointerEvents: "none",
      }}
    >
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        onError={() => setUseLocal(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
}
