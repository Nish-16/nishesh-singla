"use client";

import type { ReactNode } from "react";
import SmoothScroll from "./ui/SmoothScroll";
import CustomCursor from "./ui/CustomCursor";
import ScrollRail from "./ui/ScrollRail";
import { TerminalProvider } from "./ui/Terminal";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <TerminalProvider>
      <SmoothScroll />
      <ScrollRail />
      {children}
      <CustomCursor />
    </TerminalProvider>
  );
}
