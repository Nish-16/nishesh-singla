"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { identity, pages, projectCategories, projects, site, skillGroups, terminal } from "@/content";
import { useReducedMotion } from "@/lib/hooks";

type Line = { id: number; kind: "in" | "out" | "dim" | "accent" | "err"; text: string; href?: string };

const COMMANDS = terminal.help.map(([c]) => c.split(" ")[0]);
let lineId = 0;
const line = (kind: Line["kind"], text: string, href?: string): Line => ({ id: lineId++, kind, text, href });

// ---------------------------------------------------------------------------
// Terminal widget
// ---------------------------------------------------------------------------

export function Terminal({ autoFocus = false, onExit, className = "" }: { autoFocus?: boolean; onExit?: () => void; className?: string }) {
  const [lines, setLines] = useState<Line[]>(() => terminal.welcome.map((t) => line("dim", t)));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const history = useRef<string[]>([]);
  const histIdx = useRef(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cancelScan = useRef<(() => void) | null>(null);
  const reduced = useReducedMotion();
  const inputId = useId();
  const router = useRouter();

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  useEffect(() => () => cancelScan.current?.(), []);

  const print = useCallback((...ls: Line[]) => setLines((prev) => [...prev, ...ls]), []);

  const runScan = useCallback(() => {
    const { scan } = terminal;
    setBusy(true);
    const timers: number[] = [];
    let cancelled = false;
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(() => !cancelled && fn(), reduced ? 0 : ms));

    print(line("accent", `Starting scan on ${scan.target} — ports 1-65535, 100 threads`));
    const bar = line("dim", "[....................]   0%");
    print(bar);
    const steps = 20;
    const found = [...scan.openPorts];
    for (let i = 1; i <= steps; i++) {
      at(i * 70, () => {
        const pct = Math.round((i / steps) * 100);
        setLines((prev) =>
          prev.map((l) => (l.id === bar.id ? { ...l, text: `[${"#".repeat(i)}${".".repeat(steps - i)}] ${String(pct).padStart(3)}%` } : l)),
        );
        if (i % 4 === 0 && found.length) {
          const p = found.shift()!;
          print(line("out", `${`${p.port}/tcp`.padEnd(10)} open   ${p.service.padEnd(11)} ${p.banner}`));
        }
      });
    }
    at(steps * 70 + 150, () => {
      print(line("accent", scan.footer), line("dim", scan.benchmark));
      setBusy(false);
      cancelScan.current = null;
    });
    cancelScan.current = () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      setBusy(false);
      cancelScan.current = null;
    };
  }, [print, reduced]);

  const run = useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      print(line("in", cmd));
      if (!cmd) return;
      history.current.unshift(cmd);
      histIdx.current = -1;
      const [name, arg] = cmd.split(/\s+/);

      switch (name.toLowerCase()) {
        case "help":
          print(...terminal.help.map(([c, d]) => line("out", `${c.padEnd(10)} ${d}`)));
          break;
        case "whoami":
          print(...terminal.whoami.map((t) => line("out", t)));
          break;
        case "projects":
          print(
            ...projects.map((p) => {
              const cat = projectCategories.find((c) => c.id === p.category)!.label;
              return line("out", `${p.featured ? "★" : "·"} ${p.title.padEnd(40)} [${cat}] ${p.date}`);
            }),
            line("dim", terminal.projectsHint),
          );
          break;
        case "skills":
          print(...skillGroups.map((g) => line("out", `${(g.label + ":").padEnd(22)} ${g.skills.map((s) => s.name).join(", ")}`)));
          break;
        case "contact":
          print(
            line("out", `email     ${identity.email}`, `mailto:${identity.email}`),
            line("out", `linkedin  ${identity.linkedinLabel}`, identity.linkedin),
            line("out", `github    ${identity.githubLabel}`, identity.github),
          );
          break;
        case "resume":
          print(line("accent", terminal.resumeMessage));
          window.open(site.resumePath, "_blank", "noopener");
          break;
        case "scan":
          runScan();
          break;
        case "cd": {
          const target = (arg ?? "").replace(/^~?\/?/, "").toLowerCase();
          const page = pages.find((p) => p.label.toLowerCase() === (target || "home"));
          if (!page) {
            print(line("err", terminal.cdUsage));
          } else {
            print(line("accent", terminal.cdGoing(page.href)));
            router.push(page.href);
          }
          break;
        }
        case "clear":
          setLines([]);
          break;
        case "exit":
          onExit?.();
          break;
        default:
          print(line("err", terminal.notFound(name)));
      }
    },
    [print, runScan, onExit, router],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "c" && e.ctrlKey && busy) {
      e.preventDefault();
      cancelScan.current?.();
      print(line("err", "^C"));
      return;
    }
    if (busy) return;
    if (e.key === "Enter") {
      e.preventDefault();
      run(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(histIdx.current + 1, history.current.length - 1);
      if (next >= 0) {
        histIdx.current = next;
        setInput(history.current[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = histIdx.current - 1;
      histIdx.current = Math.max(next, -1);
      setInput(next >= 0 ? history.current[next] : "");
    } else if (e.key === "Tab") {
      const match = COMMANDS.filter((c) => c.startsWith(input.trim().toLowerCase()));
      if (input && match.length === 1) {
        e.preventDefault();
        setInput(match[0]);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  const color: Record<Line["kind"], string> = {
    in: "text-ink",
    out: "text-ink/85",
    dim: "text-muted",
    accent: "text-signal",
    err: "text-warm-bright",
  };

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border border-line bg-[#070b09] focus-within:border-signal/50 font-mono text-[13px] leading-6 shadow-[0_0_0_1px_rgb(61_245_196/0.05),0_24px_60px_-20px_rgb(0_0_0/0.8)] ${className}`}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-2 border-b border-line bg-surface px-4 py-2">
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-warm/80" />
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-warm/70" />
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-signal/80" />
        <span className="ml-2 truncate text-xs text-muted">{terminal.title}</span>
      </div>
      <div ref={scrollRef} data-lenis-prevent className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-4 py-3" role="log" aria-live="polite">
        {lines.map((l) => (
          <div key={l.id} className={`whitespace-pre-wrap break-words ${color[l.kind]}`}>
            {l.kind === "in" && <span className="text-signal">{terminal.prompt} </span>}
            {l.href ? (
              <a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="underline decoration-line underline-offset-4 hover:text-signal">
                {l.text}
              </a>
            ) : (
              l.text
            )}
          </div>
        ))}
        <div className="flex items-center">
          <label htmlFor={inputId} className="shrink-0 text-signal">
            {terminal.prompt}&nbsp;
          </label>
          <input
            id={inputId}
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            readOnly={busy}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Terminal command"
            className="min-w-0 flex-1 bg-transparent text-ink caret-signal outline-none focus-visible:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Global overlay, toggled with the backtick key
// ---------------------------------------------------------------------------

const TerminalContext = createContext<{ open: boolean; toggle: () => void; close: () => void }>({
  open: false,
  toggle: () => {},
  close: () => {},
});

export const useTerminal = () => useContext(TerminalContext);

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const returnFocus = useRef<HTMLElement | null>(null);

  const toggle = useCallback(() => {
    setOpen((o) => {
      if (!o) returnFocus.current = document.activeElement as HTMLElement | null;
      return !o;
    });
  }, []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key === "`" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Inside the overlay terminal, backtick closes it; in other fields it types normally.
        const inOverlay = !!t?.closest("[data-terminal-overlay]");
        if (typing && !inOverlay) return;
        e.preventDefault();
        toggle();
      } else if (e.key === "Escape" && open && t?.closest("[data-terminal-overlay]")) {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, close, open]);

  useEffect(() => {
    if (!open) returnFocus.current?.focus?.();
  }, [open]);

  return (
    <TerminalContext.Provider value={{ open, toggle, close }}>
      {children}
      {open && (
        <div
          role="dialog"
          aria-label={terminal.title}
          data-terminal-overlay
          className="fixed inset-x-3 bottom-3 z-[120] h-[min(420px,70vh)] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[560px]"
        >
          <Terminal autoFocus onExit={close} className="h-full" />
          <p className="label-mono pointer-events-none absolute -top-6 right-1 text-[10px] text-muted">{terminal.closeHint}</p>
        </div>
      )}
    </TerminalContext.Provider>
  );
}
