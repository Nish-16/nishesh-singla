"use client";

import { useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { hero as heroLabels } from "@/content";
import { useSiteContent } from "@/components/SiteContentProvider";
import { useInView, useIsMobile, useMounted, useReducedMotion, webglAvailable } from "@/lib/hooks";
import { useTheme } from "@/components/ThemeProvider";
import TrafficChart from "./TrafficChart";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });
const HeroFallback = dynamic(() => import("@/components/three/HeroFallback"), { ssr: false });

export default function Hero() {
  const { identity, hero } = useSiteContent();
  const mounted = useMounted();
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const webgl = useMemo(() => mounted && webglAvailable(), [mounted]);
  const use3D = mounted && webgl && !reduced && !mobile;
  const { palette } = useTheme();

  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef);

  // Fade the scene into the page as the camera pulls away.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const p = Math.min(1, window.scrollY / window.innerHeight);
      if (bgRef.current) bgRef.current.style.opacity = String(Math.max(0, 1 - p * 1.15));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={sectionRef} id="top" aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <div ref={bgRef} className="absolute inset-0 -z-10">
        {mounted && (use3D ? <HeroScene active={inView} palette={palette} /> : <HeroFallback animate={!reduced} palette={palette} />)}
        {/* scrims keep the copy at AA contrast over the scene */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-canvas via-canvas/70 to-transparent md:via-canvas/30" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-canvas via-canvas/60 to-transparent md:h-1/3" />
      </div>

      <div className="pointer-events-none relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-4 pb-32 pt-28 sm:px-6 md:pl-20 md:pb-40 lg:justify-center lg:pb-24">
        {/* the text block takes pointer events (so it's selectable); the rest lets the 3D graph receive hover */}
        <div className="pointer-events-auto w-fit max-w-full">
          <p className="label-mono text-xs text-second">{hero.eyebrow}</p>
          <h1 id="hero-title" className="mt-3 font-display text-5xl font-bold leading-[0.95] tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-8xl">
            {identity.name}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/85 md:text-xl">{identity.tagline}</p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 md:h-20">
        <TrafficChart />
        <p aria-hidden className="label-mono absolute bottom-2 right-4 text-[10px] text-muted">
          {heroLabels.scrollHint} ↓
        </p>
      </div>
    </section>
  );
}
