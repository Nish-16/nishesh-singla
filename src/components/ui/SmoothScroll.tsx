"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { useReducedMotion } from "@/lib/hooks";
import { getLenis, setLenis } from "@/lib/scroll";

export default function SmoothScroll() {
  const reduced = useReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    if (reduced) return;
    const instance = new Lenis({ lerp: 0.1, autoRaf: true, anchors: { offset: -80 } });
    setLenis(instance);
    return () => {
      setLenis(null);
      instance.destroy();
    };
  }, [reduced]);

  // On page change, reset Lenis to the top (or to the hash target) so it doesn't animate from the old position.
  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;
    const hash = window.location.hash;
    const target = hash ? document.querySelector<HTMLElement>(hash) : null;
    if (target) {
      requestAnimationFrame(() => lenis.scrollTo(target, { offset: -80, immediate: true }));
    } else {
      lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  return null;
}
