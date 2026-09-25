import type Lenis from "lenis";

// Single Lenis instance, owned by <SmoothScroll>. Null when smooth scrolling is off (reduced motion).
let lenis: Lenis | null = null;
let locks = 0;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function scrollToTarget(target: string | HTMLElement) {
  if (lenis) {
    lenis.scrollTo(target, { offset: -80 });
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  el?.scrollIntoView({ behavior: "auto", block: "start" });
}

/** Ref-counted scroll lock for modals / overlays. */
export function lockScroll() {
  locks++;
  if (locks === 1) {
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
  }
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) {
    lenis?.start();
    document.documentElement.style.overflow = "";
  }
}
