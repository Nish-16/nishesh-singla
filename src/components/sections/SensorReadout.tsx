"use client";

import { useEffect, useRef, useState } from "react";
import type { ReadoutField } from "@/content";
import { useInView, useReducedMotion } from "@/lib/hooks";

const fmt = (f: ReadoutField, v: number) => `${v.toFixed(f.decimals ?? 0)}${f.unit ?? ""}`;

/** Small animated sensor readout. Values are simulated around the field's base value. */
export default function SensorReadout({ fields, simLabel }: { fields: ReadoutField[]; simLabel: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduced = useReducedMotion();
  const [values, setValues] = useState(() => fields.map((f) => f.base ?? 0));

  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(() => {
      setValues(fields.map((f) => (f.base ?? 0) + (Math.random() - 0.5) * 2 * (f.jitter ?? 0)));
    }, 1100);
    return () => window.clearInterval(id);
  }, [inView, reduced, fields]);

  return (
    <div ref={ref} aria-hidden className="flex items-center gap-3 overflow-hidden rounded-md border border-warm/30 bg-board/70 px-3 py-2 font-mono text-[11px] text-warm-bright">
      <span className="flex items-center gap-1.5 text-[10px] text-muted">
        <span className="h-1.5 w-1.5 animate-blink rounded-full bg-signal" />
        {simLabel}
      </span>
      <span className="flex flex-wrap gap-x-3 gap-y-0.5 tabular-nums">
        {fields.map((f, i) => (
          <span key={f.label}>
            <span className="text-muted">{f.label}:</span> <span className="text-ink">{f.text ?? fmt(f, values[i])}</span>
          </span>
        ))}
      </span>
    </div>
  );
}
