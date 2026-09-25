"use client";

import type { ReactNode } from "react";
import SmoothScroll from "./ui/SmoothScroll";
import ScrollRail from "./ui/ScrollRail";
import { TerminalProvider } from "./ui/Terminal";
import { SiteContentProvider } from "./SiteContentProvider";
import type { SiteContent } from "@/lib/siteContent";

/** Client providers for the public site (the root layout supplies ThemeProvider). */
export default function Providers({ content, children }: { content: SiteContent; children: ReactNode }) {
  return (
    <SiteContentProvider content={content}>
      <TerminalProvider>
        <SmoothScroll />
        <ScrollRail />
        {children}
      </TerminalProvider>
    </SiteContentProvider>
  );
}
