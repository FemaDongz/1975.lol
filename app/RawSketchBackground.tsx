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

  #define OCTAVES 5
  float fbm(in vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < OCTAVES; i++) {
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

    // Ripple lembut tepat di kursor (radius kecil, sudut koordinat sama)
    vec2 mouseDist = st - uMouse;
    float distFactor = smoothstep(0.18, 0.0, length(mouseDist));
    q += distFactor * uVelocity * 0.6;

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

    vec3 color = mix(vec3(0.96, 0.95, 0.93), vec3(0.1, 0.1, 0.12), stroke);

    if (pattern < 0.5) {
      float hatch = sin((st.x + st.y) * 150.0);
      color = mix(color, vec3(0.2), smoothstep(0.9, 1.0, hatch) * 0.3);
    }

    float grain = random(vUv * uTime) * 0.1;
    color -= grain;
    float vignette = smoothstep(1.5, 0.5, length(vUv - 0.5));
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function RawSketchBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, 2),
      alpha: false,
      depth: false,
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
    const loop = (t: number) => {
      rafId = requestAnimationFrame(loop);
      current.lerp(target, 0.1);
      const d = current.distance(
        new Vec2(
          program.uniforms.uMouse.value[0] as number,
          program.uniforms.uMouse.value[1] as number
        )
      );
      velocity += 50 * d;
      velocity *= 0.95;
      program.uniforms.uTime.value = 0.001 * t;
      (program.uniforms.uMouse.value as Vec2).set(current.x, current.y);
      program.uniforms.uVelocity.value = velocity;
      renderer.render({ scene });
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      if (aid) window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
    };
  }, []);

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
