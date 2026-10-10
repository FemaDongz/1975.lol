"use client";

import { useEffect, useRef, useState } from "react";

// Video YouTube pas di dalam 1 sel grid background (7 kolom, baris terpusat
// seperti shader): tiap 5 detik fade-out, pindah sel random + ganti video,
// fade-in. Saturasi 20%. Autoplay muted (wajib browser).
//
// Ganti VIDEO_IDS dengan video kamu.

const VIDEO_IDS = [
  "dQw4w9WgXcQ",
  "_cr46G2xSgs",
  "ysz5S6PUM-U",
  "aqz-KE-bpKQ",
  "ScMzIvxBSi4",
  "jNQXAC9IVRw",
];

const COLS = 7;
const SHOW_MS = 5000;
const FADE_MS = 800;

type YTPlayer = {
  playVideo: () => void;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement,
        opts: Record<string, unknown>
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export default function GridVideos() {
  const holderRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [geom, setGeom] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [videoId, setVideoId] = useState(VIDEO_IDS[0]);
  const [vis, setVis] = useState(0);
  const [apiReady, setApiReady] = useState(false);
  const geomRef = useRef(geom);
  geomRef.current = geom;

  // Muat YouTube IFrame API sekali
  useEffect(() => {
    if (window.YT?.Player) {
      setApiReady(true);
      return;
    }
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
    window.onYouTubeIframeAPIReady = () => setApiReady(true);
  }, []);

  // Ukur sel grid dari container induk (samain shader: 7 kolom, baris terpusat)
  useEffect(() => {
    const parent = holderRef.current?.parentElement;
    if (!parent) return;
    const measure = () => {
      const W = parent.clientWidth;
      const H = parent.clientHeight;
      if (!W || !H) return;
      const cell = W / COLS;
      const rows = Math.max(1, Math.round(H / cell));
      const c = Math.floor(Math.random() * COLS);
      const r = Math.floor(Math.random() * rows);
      setGeom({
        x: Math.round(c * cell),
        y: Math.round(H / 2 - (rows * cell) / 2 + r * cell),
        w: Math.round(cell),
        h: Math.round(cell),
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Mount player seukuran sel
  const mount = (id: string) => {
    const holder = holderRef.current;
    if (!holder || !window.YT || !geomRef.current.w) return;
    playerRef.current?.destroy();
    holder.innerHTML = "";
    const { w, h } = geomRef.current;
    playerRef.current = new window.YT.Player(holder, {
      width: w,
      height: h,
      videoId: id,
      playerVars: {
        autoplay: 1,
        mute: 1,
        controls: 0,
        loop: 1,
        playlist: id,
        playsinline: 1,
        modestbranding: 1,
        rel: 0,
        disablekb: 1,
      },
      events: {
        onReady: (e: { target: YTPlayer }) => e.target.playVideo(),
      },
    });
  };

  // Siklus 5 detik: fade-out -> pindah sel + ganti video + mount baru -> fade-in
  useEffect(() => {
    if (!apiReady || !geom.w) return;
    mount(videoId);
    const tIn = setTimeout(() => setVis(1), 60);
    const tSwap = setTimeout(() => setVis(0), SHOW_MS - FADE_MS);
    const tNext = setTimeout(() => {
      const parent = holderRef.current?.parentElement;
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
      setVideoId(
        VIDEO_IDS[Math.floor(Math.random() * VIDEO_IDS.length)]
      );
    }, SHOW_MS);
    return () => {
      clearTimeout(tIn);
      clearTimeout(tSwap);
      clearTimeout(tNext);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiReady, geom.w, videoId]);

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
      <div ref={holderRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
