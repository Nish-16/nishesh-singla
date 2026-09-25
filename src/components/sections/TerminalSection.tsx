"use client";

import { terminal } from "@/content";
import SectionHeading from "@/components/ui/SectionHeading";
import { Terminal, useTerminal } from "@/components/ui/Terminal";

export default function TerminalSection() {
  const { toggle } = useTerminal();
  return (
    <section id="terminal" aria-labelledby="terminal-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6 md:py-32 md:pl-20">
      <SectionHeading id="terminal" />
      <Terminal className="h-[380px]" />
      <button type="button" onClick={toggle} className="label-mono mt-4 text-[11px] text-muted underline decoration-line underline-offset-4 hover:text-accent">
        {terminal.openHint}
      </button>
    </section>
  );
}
