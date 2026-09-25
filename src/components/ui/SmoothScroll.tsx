"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "@/lib/hooks";
import { setLenis } from "@/lib/scroll";

export default function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const instance = new Lenis({ lerp: 0.1, autoRaf: true, anchors: { offset: -80 } });
    setLenis(instance);
    return () => {
      setLenis(null);
      instance.destroy();
    };
  }, [reduced]);

  return null;
}
