"use client";

import * as React from "react";
import PlayStopButton from "./PlayStopButton";

// Musik control: bungkus PlayStopButton, mode STOP = lagu jalan.
const CDN_SRC =
  "https://cdn.jsdelivr.net/gh/FemaDongz/1975.lol@main/public/audio/about-you.mp3";
const LOCAL_SRC = "/audio/about-you.mp3";

export default function MusicControl() {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [useLocal, setUseLocal] = React.useState(false);

  React.useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "none";
    audio.src = useLocal ? LOCAL_SRC : CDN_SRC;
    audio.addEventListener("error", () => setUseLocal(true));
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [useLocal]);

  // mode STOP = lagu main ; PLAY = berhenti
  const handleMode = (mode: "PLAY" | "STOP") => {
    const a = audioRef.current;
    if (!a) return;
    if (mode === "STOP") a.play().catch(() => {});
    else a.pause();
  };

  return <PlayStopButton onModeChange={handleMode} />;
}
