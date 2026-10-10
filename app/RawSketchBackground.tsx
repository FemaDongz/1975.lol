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
  uniform float uPaperAlpha;
  uniform int uOctaves;

  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  // Bubble dalam satu sel: naik pelan, outline tipis + highlight (2D).
  float bubbleField(vec2 p, float t) {
    vec2 id = floor(p);
    vec2 gv = fract(p) - 0.5;

    float sum = 0.0;
    // 3 lapis grid beda skala/fase -> bubble saling mengisi, tidak menyambung.
    for (int k = 0; k < 3; k++) {
      float fk = float(k);
      vec2 idk = id + fk * 17.0;
      // posisi acak dalam sel
      vec2 rnd = vec2(random(idk), random(idk + 3.7));
      // naik pelan (offset vertikal loop)
      float rise = fract(rnd.y + t * 0.03 * (1.0 + fk * 0.3));
      vec2 center = vec2(rnd.x - 0.5, rise - 0.5) * 0.6;
      // ukuran bubble beda-beda
      float radius = 0.14 + 0.10 * random(idk + 9.1);

      float d = length(gv - center);
      // outline tipis + isian tembus
      float ring = smoothstep(radius, radius - 0.012, d)
                 - smoothstep(radius - 0.02, radius - 0.05, d);
      float fill = smoothstep(radius - 0.02, radius - 0.08, d) * 0.25;
      // kilau kecil (highlight kiri-atas)
      float hi = smoothstep(radius * 0.6, 0.0, length(gv - center + vec2(radius * 0.35, -radius * 0.35)));
      sum += ring + fill + hi * 0.35 * step(0.5, random(idk + 5.3));
    }
    return sum;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 st = uv;
    st.x *= uResolution.x / uResolution.y;

    // skala bubble (makin besar = makin rapat)
    float SCALE = 4.0;
    float field = bubbleField(st * SCALE, uTime);

    // distorsi kursor halus: bubble sedikit "terdorong" dekat kursor
    vec2 mouseDist = st - uMouse * 1.0;
    float md = smoothstep(0.25, 0.0, length(mouseDist));
    field += md * uVelocity * 0.15;

    field = clamp(field, 0.0, 1.0);

    // Palet terang (kertas + graphite) dan gelap (charcoal + kapur)
    vec3 paper = mix(vec3(0.96, 0.95, 0.93), vec3(0.05, 0.05, 0.06), uTheme);
    vec3 ink   = mix(vec3(0.15, 0.16, 0.20), vec3(0.85, 0.88, 0.95), uTheme);

    vec3 color = mix(paper, ink, field);

    // grain + vignette halus
    float grain = random(uv * uTime) * (0.05 - 0.02 * uTheme);
    color -= grain;
    float vignette = smoothstep(1.5, 0.5, length(uv - 0.5));
    color *= mix(vignette, 0.4 + 0.6 * vignette, uTheme);

    float a = mix(uPaperAlpha, 1.0, field);
    gl_FragColor = vec4(color, clamp(a, 0.0, 1.0));
  }
`;

export default function RawSketchBackground({
  dark = false,
  paperAlpha = 1,
}: {
  dark?: boolean;
  paperAlpha?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef(0);
  const targetThemeRef = useRef(dark ? 1 : 0);
  const paperAlphaRef = useRef(paperAlpha);
  const targetPaperRef = useRef(paperAlpha);

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
      transparent: true,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vec2(gl.canvas.width, gl.canvas.height) },
        uMouse: { value: new Vec2(0.5, 0.5) },
        uVelocity: { value: 0 },
        uTheme: { value: themeRef.current },
        uOctaves: { value: octaves },
        uPaperAlpha: { value: paperAlphaRef.current },
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
      // Lerp transparansi kertas (intro: angka tembus)
      paperAlphaRef.current +=
        (targetPaperRef.current - paperAlphaRef.current) * 0.08;
      program.uniforms.uPaperAlpha.value = paperAlphaRef.current;
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

  useEffect(() => {
    targetPaperRef.current = paperAlpha;
  }, [paperAlpha]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        pointerEvents: "none",
      }}
    />
  );
}
