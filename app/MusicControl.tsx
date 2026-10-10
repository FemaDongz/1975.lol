"use client";

import * as React from "react";
import { LiquidMetalButton } from "./LiquidMetalButton";

// Tombol musik pakai LiquidMetalButton:
// - PLAY: warna metalik normal, teks "PLAY"
// - STOP (lagu jalan): warna MERAH + shader berdenyut mengikuti level suara
//   (Web Audio Analyser). Label "STOP".
// - Rounded & gap mengikuti prop.

const CDN_SRC =
  "https://cdn.jsdelivr.net/gh/FemaDongz/1975.lol@main/public/audio/about-you.mp3";
const LOCAL_SRC = "/audio/about-you.mp3";

export default function MusicControl() {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const ctxRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const dataRef = React.useRef<Uint8Array<ArrayBuffer> | null>(null);
  const rafRef = React.useRef<number>(0);

  const [playing, setPlaying] = React.useState(false);
  const [level, setLevel] = React.useState(0);
  const [useLocal, setUseLocal] = React.useState(false);

  // siapkan audio + analyser sekali
  React.useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "none";
    audio.crossOrigin = "anonymous";
    audio.src = useLocal ? LOCAL_SRC : CDN_SRC;
    audio.addEventListener("error", () => setUseLocal(true));
    audio.addEventListener("pause", () => setPlaying(false));
    audio.addEventListener("play", () => setPlaying(true));
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [useLocal]);

  // loop level suara saat main
  React.useEffect(() => {
    if (!playing) {
      setLevel(0);
      cancelAnimationFrame(rafRef.current);
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (!ctxRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AC();
      const src = ctx.createMediaElementSource(audio);
      const an = ctx.createAnalyser();
      an.fftSize = 256;
      an.smoothingTimeConstant = 0.8;
      src.connect(an);
      an.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = an;
      dataRef.current = new Uint8Array(new ArrayBuffer(an.frequencyBinCount));
    }
    ctxRef.current.resume().catch(() => {});
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      const an = analyserRef.current;
      const data = dataRef.current;
      if (!an || !data) return;
      an.getByteFrequencyData(data);
      // rata-rata band rendah-tengah (vokal/bass)
      let sum = 0;
      const n = Math.floor(data.length * 0.5);
      for (let i = 0; i < n; i++) sum += data[i];
      setLevel(sum / n / 255);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  };

  return (
    <LiquidMetalButton
      label={playing ? "STOP" : "PLAY"}
      onClick={toggle}
      audioLevel={playing ? level : undefined}
      tint={playing ? "#ff2e2e" : undefined}
      width={150}
      radius={22}
    />
  );
}
