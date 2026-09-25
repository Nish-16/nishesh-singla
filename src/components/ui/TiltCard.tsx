"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useRichMotion } from "@/lib/hooks";

/** CSS-perspective tilt with a pointer-following glare. Disabled on touch / reduced motion. */
export default function TiltCard({
  children,
  className = "",
  glow,
  max = 8,
}: {
  children: ReactNode;
  className?: string;
  glow: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rich = useRichMotion();

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!rich || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ref.current.style.setProperty("--rx", `${(0.5 - py) * max * 2}deg`);
    ref.current.style.setProperty("--ry", `${(px - 0.5) * max * 2}deg`);
    ref.current.style.setProperty("--gx", `${px * 100}%`);
    ref.current.style.setProperty("--gy", `${py * 100}%`);
  };
  const reset = () => {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  };

  return (
    <div className="h-full [perspective:1000px]">
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={{ "--glow": glow } as CSSProperties}
        className={`group relative h-full rounded-xl border border-line bg-surface transition-[transform,border-color,box-shadow] duration-300 ease-out [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d] hover:border-[color:var(--glow)] hover:shadow-[0_0_0_1px_var(--glow),0_0_36px_-6px_var(--glow)] focus-within:border-[color:var(--glow)] ${className}`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: "radial-gradient(420px circle at var(--gx,50%) var(--gy,50%), color-mix(in srgb, var(--glow) 12%, transparent), transparent 60%)",
          }}
        />
        {children}
      </div>
    </div>
  );
}
