"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks";
import { useTheme } from "@/components/ThemeProvider";
import { withAlpha } from "@/lib/theme";

const N = 160;

/** Monitoring-style traffic sparkline along the bottom of the hero. Mouse movement adds load. */
export default function TrafficChart() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const { palette: P } = useTheme();

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let visible = true;
    let w = 0;
    let h = 0;
    let load = 0;
    let offset = 0;
    let last = performance.now();
    let seed = 1;
    const noise = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const series: number[] = [];
    let v = 0.4;
    const next = () => {
      v += (noise() - 0.5) * 0.12 + (0.4 + load * 0.35 - v) * 0.08;
      v = Math.min(0.95, Math.max(0.08, v));
      return v + (noise() < 0.04 ? noise() * 0.3 : 0);
    };
    for (let i = 0; i < N; i++) series.push(next());

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const step = w / (N - 2);
      const y = (val: number) => h - 6 - val * (h - 14);

      ctx.strokeStyle = P.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const f of [0.33, 0.66]) {
        ctx.moveTo(0, Math.round(h * f) + 0.5);
        ctx.lineTo(w, Math.round(h * f) + 0.5);
      }
      ctx.stroke();

      ctx.beginPath();
      series.forEach((val, i) => {
        const x = i * step - offset * step;
        if (i === 0) ctx.moveTo(x, y(val));
        else ctx.lineTo(x, y(val));
      });
      const line = new Path2D();
      series.forEach((val, i) => {
        const x = i * step - offset * step;
        if (i === 0) line.moveTo(x, y(val));
        else line.lineTo(x, y(val));
      });
      ctx.lineTo(w + step, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, withAlpha(P.accent, 0.16));
      grad.addColorStop(1, withAlpha(P.accent, 0));
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = P.ink;
      ctx.lineWidth = 1.25;
      ctx.stroke(line);
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      load *= 0.97;
      offset += dt * 6;
      while (offset >= 1) {
        offset -= 1;
        series.shift();
        series.push(next());
      }
      draw();
      if (visible) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      load = Math.min(1, load + Math.hypot(e.movementX, e.movementY) / 400);
    };

    resize();
    draw();
    if (reduced) {
      const onResize = () => {
        resize();
        draw();
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      last = performance.now();
      if (visible) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, [reduced, P]);

  return <canvas ref={ref} aria-hidden className="h-full w-full" />;
}
