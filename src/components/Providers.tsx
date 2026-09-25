"use client";

import type { ReactNode } from "react";
import SmoothScroll from "./ui/SmoothScroll";
import ScrollRail from "./ui/ScrollRail";
import { TerminalProvider } from "./ui/Terminal";
import { ThemeProvider } from "./ThemeProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TerminalProvider>
        <SmoothScroll />
        <ScrollRail />
        {children}
      </TerminalProvider>
    </ThemeProvider>
  );
}
