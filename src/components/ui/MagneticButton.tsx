"use client";

import { useRef, type AnchorHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { useRichMotion } from "@/lib/hooks";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: "primary" | "ghost";
  children: ReactNode;
};

const VARIANTS = {
  primary: "bg-signal text-board hover:shadow-[0_0_28px_rgb(61_245_196/0.55)] border border-signal",
  ghost: "border border-warm/70 text-ink hover:border-warm hover:bg-warm/10",
};

/** Link-button that leans toward the pointer. Internal routes use next/link. */
export default function MagneticButton({ href, variant = "primary", className = "", children, ...rest }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const rich = useRichMotion();

  const onPointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (!rich || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * 0.28;
    const y = (e.clientY - (r.top + r.height / 2)) * 0.4;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };
  const onPointerLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  const props = {
    ref,
    onPointerMove,
    onPointerLeave,
    className: `inline-flex items-center gap-2 rounded-md px-5 py-3 font-mono text-sm font-medium transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out ${VARIANTS[variant]} ${className}`,
    ...rest,
  };

  const internal = href.startsWith("/") && !/\.\w+$/.test(href.split("#")[0]);
  return internal ? (
    <Link href={href} {...props}>
      {children}
    </Link>
  ) : (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
