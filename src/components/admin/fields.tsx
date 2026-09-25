"use client";

import { useId, useState, type ReactNode } from "react";

const input =
  "w-full rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:border-ink focus:outline-none";

export function Field({ label, hint, children, id }: { label: string; hint?: string; children: ReactNode; id: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-mono text-[11px] uppercase tracking-wider text-muted">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-muted">{hint}</p>}
    </div>
  );
}

export function Text({
  label,
  value,
  onChange,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} id={id}>
      <input id={id} className={input} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function Num({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  hint?: string;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} id={id}>
      <input
        id={id}
        type="number"
        step="any"
        className={input}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      />
    </Field>
  );
}

export function Area({
  label,
  value,
  onChange,
  hint,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  rows?: number;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} id={id}>
      <textarea id={id} rows={rows} className={`${input} resize-y`} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

/** string[] edited as one item per line. Keeps a local draft so typing blank lines doesn't fight the parser. */
export function Lines({
  label,
  value,
  onChange,
  hint,
  rows = 4,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  hint?: string;
  rows?: number;
}) {
  const id = useId();
  const joined = (value ?? []).join("\n");
  const [draft, setDraft] = useState(joined);
  const [synced, setSynced] = useState(joined);
  if (joined !== synced) {
    setSynced(joined);
    setDraft(joined);
  }
  return (
    <Field label={label} hint={hint ?? "One per line."} id={id}>
      <textarea
        id={id}
        rows={rows}
        className={`${input} resize-y`}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          const next = e.target.value
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);
          setSynced(next.join("\n"));
          onChange(next);
        }}
      />
    </Field>
  );
}

/** string[] edited as a comma-separated list. */
export function Tags({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string[] | undefined;
  onChange: (v: string[]) => void;
  hint?: string;
}) {
  const id = useId();
  const joined = (value ?? []).join(", ");
  const [draft, setDraft] = useState(joined);
  const [synced, setSynced] = useState(joined);
  if (joined !== synced) {
    setSynced(joined);
    setDraft(joined);
  }
  return (
    <Field label={label} hint={hint ?? "Comma-separated."} id={id}>
      <input
        id={id}
        className={input}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          const next = e.target.value
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
          setSynced(next.join(", "));
          onChange(next);
        }}
      />
    </Field>
  );
}

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const id = useId();
  return (
    <Field label={label} id={id}>
      <select id={id} className={input} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Check({ label, value, onChange }: { label: string; value: boolean | undefined; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink">
      <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[var(--color-accent)]" />
      {label}
    </label>
  );
}

const btn =
  "rounded-md border border-line px-2.5 py-1 font-mono text-[11px] text-muted transition-colors hover:border-ink hover:text-ink disabled:opacity-30";

/** Generic list editor: collapsible items with move up/down, delete, and add. */
export function ListEditor<T>({
  items,
  onChange,
  newItem,
  itemLabel,
  addLabel = "Add item",
  render,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  newItem: () => T;
  itemLabel: (item: T, index: number) => string;
  addLabel?: string;
  render: (item: T, update: (next: T) => void, index: number) => ReactNode;
}) {
  const move = (i: number, d: number) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <details key={i} className="group rounded-lg border border-line bg-surface open:border-ink/30">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
            <span className="truncate text-sm font-medium text-ink">
              <span className="mr-2 font-mono text-[11px] text-muted">{String(i + 1).padStart(2, "0")}</span>
              {itemLabel(item, i) || <em className="text-muted">untitled</em>}
            </span>
            <span className="font-mono text-[11px] text-muted group-open:hidden">edit ▾</span>
            <span className="hidden font-mono text-[11px] text-muted group-open:inline">close ▴</span>
          </summary>
          <div className="flex flex-col gap-4 border-t border-line px-4 py-4">
            {render(item, (nextItem) => onChange(items.map((x, j) => (j === i ? nextItem : x))), i)}
            <div className="flex flex-wrap gap-2 border-t border-line pt-3">
              <button type="button" className={btn} disabled={i === 0} onClick={() => move(i, -1)}>
                ↑ move up
              </button>
              <button type="button" className={btn} disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                ↓ move down
              </button>
              <button
                type="button"
                className={`${btn} ml-auto hover:border-accent hover:text-accent`}
                onClick={() => {
                  if (window.confirm(`Delete "${itemLabel(item, i) || "this item"}"?`)) onChange(items.filter((_, j) => j !== i));
                }}
              >
                ✕ delete
              </button>
            </div>
          </div>
        </details>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, newItem()])}
        className="w-fit rounded-md border border-dashed border-line px-4 py-2 font-mono text-xs text-ink hover:border-ink"
      >
        + {addLabel}
      </button>
    </div>
  );
}

export function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
