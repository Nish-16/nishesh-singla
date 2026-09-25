"use client";

import { useEffect, useRef } from "react";
import { ARCH_EDGES, ARCH_NODES, NODE_H, NODE_W, bezier, edgeControlPoints } from "@/lib/arch";
import type { Palette } from "@/lib/theme";

const CURVES = ARCH_EDGES.map(([a, b]) => edgeControlPoints(a, b));

/**
 * Lightweight 2D canvas version of the hero graph, for mobile and reduced motion.
 * Animates packets on mobile; renders a single static frame when `animate` is false.
 */
export default function HeroFallback({ animate, palette: P }: { animate: boolean; palette: Palette }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-jetbrains-mono").trim() || "monospace";
    let raf = 0;
    let visible = true;
    let w = 0;
    let h = 0;
    let scale = 1;
    let ox = 0;
    let oy = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scale = Math.min(w / 11.5, h / 9);
      ox = w / 2;
      oy = h * 0.3;
    };
    const X = (x: number) => ox + x * scale;
    const Y = (y: number) => oy - y * scale;

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = P.muted;
      ctx.lineWidth = 1;
      for (const cp of CURVES) {
        ctx.beginPath();
        ctx.moveTo(X(cp[0][0]), Y(cp[0][1]));
        ctx.bezierCurveTo(X(cp[1][0]), Y(cp[1][1]), X(cp[2][0]), Y(cp[2][1]), X(cp[3][0]), Y(cp[3][1]));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      for (const n of ARCH_NODES) {
        const x = X(n.pos[0] - NODE_W / 2);
        const y = Y(n.pos[1] + NODE_H / 2);
        ctx.fillStyle = P.surface;
        ctx.strokeStyle = P.lineStrong;
        ctx.fillRect(x, y, NODE_W * scale, NODE_H * scale);
        ctx.strokeRect(x + 0.5, y + 0.5, NODE_W * scale, NODE_H * scale);
        ctx.fillStyle = P.ink;
        ctx.font = `600 ${Math.max(9, scale * 0.26)}px ${mono}`;
        ctx.textBaseline = "middle";
        ctx.fillText(n.label, x + scale * 0.14, y + (NODE_H * scale) / 2);
      }

      const t = time / 1000;
      CURVES.forEach((cp, i) => {
        const u = ((i * 0.37) % 1 + t * 0.32) % 1;
        const [x, y] = bezier(cp, u);
        ctx.fillStyle = P.accent;
        ctx.beginPath();
        ctx.arc(X(x), Y(y), Math.max(2, scale * 0.07), 0, Math.PI * 2);
        ctx.fill();
        const [bx, by] = bezier(cp, 1 - ((u + 0.25) % 1));
        ctx.fillStyle = P.ink;
        ctx.beginPath();
        ctx.arc(X(bx), Y(by), Math.max(2, scale * 0.06), 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const loop = (time: number) => {
      draw(time);
      if (animate && visible) raf = requestAnimationFrame(loop);
    };

    resize();
    draw(0);
    document.fonts?.ready.then(() => draw(performance.now()));
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && animate) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    const onResize = () => {
      resize();
      draw(performance.now());
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [animate, P]);

  return <canvas ref={ref} aria-hidden className="h-full w-full" />;
}
