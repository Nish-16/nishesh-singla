"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { Icon } from "./icons";

export const inputCls =
  "w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-muted/60 transition-[border-color,box-shadow] hover:border-muted/50 focus:border-ink focus:outline-none focus:ring-2 focus:ring-accent/20";
const errorCls = "border-accent/70 focus:border-accent";

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export function Card({ title, description, children, aside }: { title?: string; description?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-surface">
      {(title || aside) && (
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            {title && <h3 className="text-[15px] font-semibold text-ink">{title}</h3>}
            {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
          </div>
          {aside}
        </header>
      )}
      <div className="flex flex-col gap-5 px-5 py-5">{children}</div>
    </section>
  );
}

export function Grid({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return <div className={`grid gap-4 ${cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>{children}</div>;
}

export function Field({
  label,
  hint,
  error,
  id,
  counter,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  id: string;
  counter?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-medium text-ink">
          {label}
        </label>
        {counter && <span className="font-mono text-[11px] text-muted">{counter}</span>}
      </div>
      {children}
      {error ? <p className="text-xs text-accent">{error}</p> : hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

type Base = { label: string; hint?: string; error?: string; placeholder?: string };

export function Text({ label, value, onChange, hint, error, placeholder, mono }: Base & { value: string; onChange: (v: string) => void; mono?: boolean }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} error={error} id={id}>
      <input
        id={id}
        className={`${inputCls} h-10 ${mono ? "font-mono text-[13px]" : ""} ${error ? errorCls : ""}`}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function Num({ label, value, onChange, hint }: Base & { value: number | undefined; onChange: (v: number | undefined) => void }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} id={id}>
      <input
        id={id}
        type="number"
        step="any"
        className={`${inputCls} h-10 font-mono text-[13px]`}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      />
    </Field>
  );
}

/** Auto-growing textarea with an optional soft character guide. */
export function Area({ label, value, onChange, hint, error, placeholder, rows = 2, soft }: Base & { value: string; onChange: (v: string) => void; rows?: number; soft?: number }) {
  const id = useId();
  const len = (value ?? "").length;
  return (
    <Field label={label} hint={hint} error={error} id={id} counter={soft ? `${len}/${soft}` : undefined}>
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        className={`${inputCls} field-sizing-content min-h-[4.5rem] resize-none leading-relaxed ${error ? errorCls : ""} ${soft && len > soft ? "border-accent/50" : ""}`}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function Select<T extends string>({ label, value, options, onChange, hint }: Base & { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} id={id}>
      <select id={id} className={`${inputCls} h-10`} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/** On/off switch. */
export function Toggle({ label, description, value, onChange }: { label: string; description?: string; value: boolean | undefined; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-line bg-canvas px-4 py-3">
      <label htmlFor={id} className="flex flex-col">
        <span className="text-[13px] font-medium text-ink">{label}</span>
        {description && <span className="text-xs text-muted">{description}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={!!value}
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${value ? "border-accent bg-accent" : "border-line bg-surface-2"}`}
      >
        <span className={`absolute top-0.5 h-[18px] w-[18px] rounded-full transition-all ${value ? "left-[22px] bg-on-accent" : "left-0.5 bg-muted"}`} />
      </button>
    </div>
  );
}

/** Chip input: type and press Enter / comma to add, ✕ or Backspace to remove. */
export function TagInput({ label, value, onChange, hint, placeholder = "Type and press Enter" }: Base & { value: string[] | undefined; onChange: (v: string[]) => void }) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const tags = value ?? [];

  const commit = (raw: string) => {
    const parts = raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .filter((t) => !tags.includes(t));
    if (parts.length) onChange([...tags, ...parts]);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && !draft && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <Field label={label} hint={hint} id={id}>
      <div className={`${inputCls} flex min-h-10 flex-wrap items-center gap-1.5 px-2 py-1.5 focus-within:border-ink focus-within:ring-2 focus-within:ring-accent/20`}>
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-md border border-line bg-surface-2 py-0.5 pl-2 pr-1 font-mono text-xs text-ink">
            {t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(tags.filter((x) => x !== t))} className="rounded p-0.5 text-muted hover:text-ink">
              <Icon name="x" size={12} />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => draft && commit(draft)}
          placeholder={tags.length ? "" : placeholder}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-0.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none"
        />
      </div>
    </Field>
  );
}

const rowBtn = "grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-30";

/** string[] edited as separate rows (bullets, paragraphs). */
export function StringList({
  label,
  value,
  onChange,
  hint,
  placeholder,
  addLabel = "Add line",
}: Base & { value: string[]; onChange: (v: string[]) => void; addLabel?: string }) {
  const items = value ?? [];
  const set = (i: number, v: string) => onChange(items.map((x, j) => (j === i ? v : x)));
  const move = (i: number, d: number) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-ink">{label}</span>
        <span className="font-mono text-[11px] text-muted">{items.length}</span>
      </div>
      {items.map((line, i) => (
        <div key={i} className="group flex items-start gap-1.5">
          <span className="mt-2.5 w-5 shrink-0 text-right font-mono text-[11px] text-muted">{i + 1}</span>
          <textarea
            aria-label={`${label} ${i + 1}`}
            rows={1}
            value={line}
            placeholder={placeholder}
            onChange={(e) => set(i, e.target.value)}
            className={`${inputCls} field-sizing-content min-h-10 resize-none leading-relaxed`}
          />
          <div className="flex opacity-60 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <button type="button" aria-label="Move up" className={rowBtn} disabled={i === 0} onClick={() => move(i, -1)}>
              <Icon name="up" size={14} />
            </button>
            <button type="button" aria-label="Move down" className={rowBtn} disabled={i === items.length - 1} onClick={() => move(i, 1)}>
              <Icon name="down" size={14} />
            </button>
            <button type="button" aria-label="Remove" className={`${rowBtn} hover:text-accent`} onClick={() => onChange(items.filter((_, j) => j !== i))}>
              <Icon name="x" size={14} />
            </button>
          </div>
        </div>
      ))}
      {hint && <p className="text-xs text-muted">{hint}</p>}
      <AddButton onClick={() => onChange([...items, ""])}>{addLabel}</AddButton>
    </div>
  );
}

/** Rows of two inputs (e.g. key numbers: value + label). */
export function PairList<T extends Record<string, string>>({
  label,
  value,
  onChange,
  keys,
  headings,
  placeholders,
  hint,
  addLabel = "Add row",
}: {
  label: string;
  value: T[];
  onChange: (v: T[]) => void;
  keys: [keyof T & string, keyof T & string];
  headings: [string, string];
  placeholders?: [string, string];
  hint?: string;
  addLabel?: string;
}) {
  const rows = value ?? [];
  const set = (i: number, k: keyof T, v: string) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-ink">{label}</span>
      {rows.length > 0 && (
        <div className="grid grid-cols-[8rem_1fr_2rem] gap-2 px-0.5 font-mono text-[11px] text-muted">
          <span>{headings[0]}</span>
          <span>{headings[1]}</span>
        </div>
      )}
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[8rem_1fr_2rem] items-center gap-2">
          <input aria-label={`${headings[0]} ${i + 1}`} className={`${inputCls} h-10 font-mono`} value={r[keys[0]] ?? ""} placeholder={placeholders?.[0]} onChange={(e) => set(i, keys[0], e.target.value)} />
          <input aria-label={`${headings[1]} ${i + 1}`} className={`${inputCls} h-10`} value={r[keys[1]] ?? ""} placeholder={placeholders?.[1]} onChange={(e) => set(i, keys[1], e.target.value)} />
          <button type="button" aria-label="Remove row" className={`${rowBtn} hover:text-accent`} onClick={() => onChange(rows.filter((_, j) => j !== i))}>
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
      {hint && <p className="text-xs text-muted">{hint}</p>}
      <AddButton onClick={() => onChange([...rows, { [keys[0]]: "", [keys[1]]: "" } as T])}>{addLabel}</AddButton>
    </div>
  );
}

export function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-2 text-[13px] text-muted transition-colors hover:border-ink hover:text-ink"
    >
      <Icon name="plus" size={14} />
      {children}
    </button>
  );
}
