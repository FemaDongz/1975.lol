"use client";

import { useEffect, useRef } from "react";
import { Renderer, Transform, Mesh, Plane, Program, Vec2 } from "ogl";

// Domain Warping + FBM noise ink sketch (from Uilora RawSketchHero).
// Renderer OGL langsung, kompatibel React 18.

const VERT = /* glsl */ `
  attribute vec3 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uVelocity;
  uniform float uTheme;
  uniform int uOctaves;

  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float noise(in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  // FBM dgn jumlah octave yang bisa dikonfigurasi (1-5) berdasarkan device.
  float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      if (i >= uOctaves) break;
      value += amplitude * noise(st);
      st *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  float warp(vec2 st, out vec2 q, out vec2 r) {
    vec2 offset = vec2(0.0);
    q.x = fbm(st + vec2(0.0, 0.0) + 0.1 * uTime);
    q.y = fbm(st + vec2(5.2, 1.3) + 0.3 * uTime);

    // Distorsi kursor: radius KECIL (lingkaran kursor rapat) + kuat.
    // warp() dipanggil dgn st*3.0, jadi samakan skala koordinat mouse (×3).
    vec2 mouseDist = st - uMouse * 3.0;
    float distFactor = smoothstep(0.18, 0.0, length(mouseDist));
    q += distFactor * uVelocity * 0.5;

    // Ripple gelombang global di background: sangat halus & pelan (kalem).
    float bgRipple = sin(length(st) * 0.28 - uTime * 0.12)
                   + 0.35 * sin(dot(st, vec2(0.18, 0.12)) - uTime * 0.08);
    q += bgRipple * 0.025;

    r.x = fbm(st + 4.0 * q + vec2(1.7, 9.2) + 0.15 * uTime);
    r.y = fbm(st + 4.0 * q + vec2(8.3, 2.8) + 0.126 * uTime);

    return fbm(st + 4.0 * r);
  }

  void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    st.x *= uResolution.x / uResolution.y;

    st += (random(st * 10.0) - 0.5) * 0.005;

    vec2 q, r;
    float pattern = warp(st * 3.0, q, r);
    float lines = sin(pattern * 20.0 + uTime * 0.5);
    float stroke = smoothstep(0.4, 0.5, lines) - smoothstep(0.5, 0.6, lines);

    // Palet terang (kertas + graphite) dan gelap (charcoal + kapur)
    vec3 paper = mix(vec3(0.96, 0.95, 0.93), vec3(0.05, 0.05, 0.06), uTheme);
    vec3 ink = mix(vec3(0.1, 0.1, 0.12), vec3(0.85, 0.86, 0.9), uTheme);
    vec3 hatchCol = mix(vec3(0.2), vec3(0.7), uTheme);

    vec3 color = mix(paper, ink, stroke);

    if (pattern < 0.5) {
      float hatch = sin((st.x + st.y) * 150.0);
      color = mix(color, hatchCol, smoothstep(0.9, 1.0, hatch) * 0.3);
    }

    float grain = random(vUv * uTime) * (0.1 - 0.04 * uTheme);
    color -= grain;
    float vignette = smoothstep(1.5, 0.5, length(vUv - 0.5));
    color *= mix(vignette, 0.35 + 0.65 * vignette, uTheme);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function RawSketchBackground({
  dark = false,
}: {
  dark?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef(0);
  const targetThemeRef = useRef(dark ? 1 : 0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Deteksi device: HP/GPU lemah -> octave lebih rendah, DPR rendah, 30fps cap.
    const isMobile =
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
      window.matchMedia("(pointer: coarse)").matches;
    const LOW_MEM =
      (navigator as unknown as { deviceMemory?: number }).deviceMemory !==
        undefined &&
      ((navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8) <=
        4;
    const weak = isMobile || LOW_MEM;
    const octaves = weak ? 3 : 5;
    const dprCap = weak ? 1 : 2;
    const frameMs = weak ? 1000 / 30 : 0; // HP: cap 30fps biar stabil

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, dprCap),
      alpha: false,
      depth: false,
      antialias: false,
      powerPreference: "high-performance",
    });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);

    const scene = new Transform();
    const geometry = new Plane(gl, { width: 2, height: 2 });

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vec2(gl.canvas.width, gl.canvas.height) },
        uMouse: { value: new Vec2(0.5, 0.5) },
        uVelocity: { value: 0 },
        uTheme: { value: themeRef.current },
        uOctaves: { value: octaves },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    mesh.setParent(scene);

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      (program.uniforms.uResolution.value as Vec2).set(
        gl.canvas.width,
        gl.canvas.height
      );
    };
    window.addEventListener("resize", onResize, false);
    onResize();

    const target = new Vec2(0.5, 0.5);
    const current = new Vec2(0.5, 0.5);
    let velocity = 0;
    const aid = window.matchMedia("(hover: hover)").matches;

    // Samakan ruang koordinat dengan shader: st.x *= aspect, jadi mouse.x juga.
    const setTarget = (cx: number, cy: number) => {
      const aspect = window.innerWidth / window.innerHeight;
      target.set((cx / window.innerWidth) * aspect, 1 - cy / window.innerHeight);
    };
    const onMove = (e: MouseEvent) => setTarget(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) setTarget(e.touches[0].clientX, e.touches[0].clientY);
    };
    if (aid) window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouch, { passive: true });

    let rafId = 0;
    let prevTime = 0;
    let acc = 0;
    // Visibility: pause render saat tab tidak aktif (hemat baterai + GPU)
    let visible = !document.hidden;
    const onVis = () => {
      visible = !document.hidden;
      prevTime = 0;
    };
    document.addEventListener("visibilitychange", onVis);

    const loop = (t: number) => {
      rafId = requestAnimationFrame(loop);
      if (!visible) return;
      const dt = prevTime ? Math.min(t - prevTime, 64) : 16.7;
      // Cap framerate di HP biar stabil (skip frame kalau belum waktunya).
      if (frameMs > 0) {
        acc += dt;
        if (acc < frameMs) return;
        acc = 0;
      }
      prevTime = t;
      current.lerp(target, 0.05);
      const d = current.distance(
        new Vec2(
          program.uniforms.uMouse.value[0] as number,
          program.uniforms.uMouse.value[1] as number
        )
      );
      // Distorsi kursor ringan (radius kursor sudah kecil di shader).
      velocity += 45 * d * (dt / 16.7);
      velocity *= Math.pow(0.94, dt / 16.7);
      // Lerp tema buat transisi terang <-> gelap yang mulus
      themeRef.current += (targetThemeRef.current - themeRef.current) * 0.06;
      program.uniforms.uTheme.value = themeRef.current;
      program.uniforms.uTime.value = 0.001 * t;
      (program.uniforms.uMouse.value as Vec2).set(current.x, current.y);
      program.uniforms.uVelocity.value = velocity;
      renderer.render({ scene });
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      if (aid) window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
    };
  }, []);

  useEffect(() => {
    targetThemeRef.current = dark ? 1 : 0;
  }, [dark]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
