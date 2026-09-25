"use client";

import { useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { hero, identity } from "@/content";
import { useInView, useIsMobile, useMounted, useReducedMotion, webglAvailable } from "@/lib/hooks";
import MagneticButton from "@/components/ui/MagneticButton";
import TrafficChart from "./TrafficChart";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });
const HeroFallback = dynamic(() => import("@/components/three/HeroFallback"), { ssr: false });

export default function Hero() {
  const mounted = useMounted();
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const webgl = useMemo(() => mounted && webglAvailable(), [mounted]);
  const use3D = mounted && webgl && !reduced && !mobile;

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
    <section ref={sectionRef} aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <div ref={bgRef} className="absolute inset-0 -z-10">
        {mounted && (use3D ? <HeroScene active={inView} /> : <HeroFallback animate={!reduced} />)}
        {/* scrims keep the copy at AA contrast over the scene */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-board via-board/70 to-transparent md:via-board/30" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-board via-board/60 to-transparent md:h-1/3" />
      </div>

      <div className="pointer-events-none relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-4 pb-32 pt-28 sm:px-6 md:pl-20 md:pb-40 lg:justify-center lg:pb-24">
        <p className="label-mono inline-flex w-fit items-center gap-2 rounded border border-signal/30 bg-board/70 px-2.5 py-1 text-[11px] text-signal">
          <span aria-hidden className="h-2 w-2 animate-blink rounded-full bg-signal shadow-[0_0_8px_#3DF5C4]" />
          {identity.systemTag}
          <span className="normal-case tracking-normal text-muted">· {identity.status}</span>
        </p>
        <p className="label-mono mt-6 text-xs text-warm">{hero.eyebrow}</p>
        <h1 id="hero-title" className="mt-3 font-display text-5xl font-bold leading-[0.95] tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-8xl">
          {identity.name}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/85 md:text-xl">{identity.tagline}</p>
        <div className="pointer-events-auto mt-9 flex flex-wrap gap-3">
          <MagneticButton href={hero.ctaPrimary.href}>
            {hero.ctaPrimary.label}
            <span aria-hidden>→</span>
          </MagneticButton>
          <MagneticButton href={hero.ctaSecondary.href} variant="ghost" download>
            {hero.ctaSecondary.label}
            <span aria-hidden>↓</span>
          </MagneticButton>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 md:h-20">
        <TrafficChart />
        <p aria-hidden className="label-mono absolute bottom-2 right-4 text-[10px] text-muted">
          {hero.scrollHint} ↓
        </p>
      </div>
    </section>
  );
}
