"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "./icons";
import { useToast } from "./toast";

type Props<T> = {
  items: T[];
  onChange: (items: T[]) => void;
  noun: string;
  newItem: () => T;
  title: (item: T) => string;
  meta?: (item: T) => ReactNode;
  badge?: (item: T) => ReactNode;
  search?: (item: T) => string;
  issues?: (item: T, index: number) => string[];
  viewHref?: (item: T) => string | null;
  selected: number;
  onSelect: (index: number) => void;
  render: (item: T, update: (next: T) => void, index: number) => ReactNode;
};

const iconBtn = "grid h-8 w-8 place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent";

/**
 * List on the left (search, drag to reorder, add), editor for the selected item on the right.
 * Delete is undoable via a toast instead of a confirm dialog.
 */
export function MasterDetail<T>({ items, onChange, noun, newItem, title, meta, badge, search, issues, viewHref, selected, onSelect, render }: Props<T>) {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const index = items.length ? Math.min(Math.max(selected, 0), items.length - 1) : -1;
  const current = index >= 0 ? items[index] : null;
  const q = query.trim().toLowerCase();
  const visible = items.map((item, i) => ({ item, i })).filter(({ item }) => !q || (search ?? title)(item).toLowerCase().includes(q));

  const add = () => {
    onChange([...items, newItem()]);
    onSelect(items.length);
    setQuery("");
  };

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= items.length) return;
    const next = [...items];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onChange(next);
    onSelect(to);
  };

  const duplicate = (i: number) => {
    const copy = structuredClone(items[i]);
    const next = [...items];
    next.splice(i + 1, 0, copy);
    onChange(next);
    onSelect(i + 1);
    toast({ message: `Duplicated ${noun}.`, tone: "success" });
  };

  const remove = (i: number) => {
    const removed = items[i];
    const next = items.filter((_, j) => j !== i);
    onChange(next);
    onSelect(Math.max(0, i - 1));
    toast({
      message: `Deleted "${title(removed) || `untitled ${noun}`}".`,
      duration: 8000,
      action: {
        label: "Undo",
        onClick: () => {
          const restored = [...next];
          restored.splice(i, 0, removed);
          onChange(restored);
          onSelect(i);
        },
      },
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(260px,300px)_1fr]">
      {/* list */}
      <div className="flex flex-col gap-3 lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)] lg:self-start">
        <div className="flex gap-2">
          {items.length > 5 && (
            <label className="relative flex-1">
              <span className="sr-only">Search</span>
              <Icon name="search" size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${noun}s`}
                className="h-9 w-full rounded-lg border border-line bg-surface pl-8 pr-3 text-sm text-ink placeholder:text-muted/70 focus:border-ink focus:outline-none"
              />
            </label>
          )}
          <button
            type="button"
            onClick={add}
            className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-ink bg-ink px-3 text-[13px] font-medium text-canvas transition-colors hover:border-accent hover:bg-accent hover:text-on-accent ${items.length > 5 ? "" : "flex-1"}`}
          >
            <Icon name="plus" size={14} />
            Add {noun}
          </button>
        </div>

        <ul className="scrollbar-thin flex flex-col gap-1 overflow-y-auto rounded-xl border border-line bg-surface p-1.5" data-lenis-prevent>
          {visible.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">{items.length ? "No matches." : `No ${noun}s yet.`}</li>}
          {visible.map(({ item, i }) => {
            const active = i === index;
            const problems = issues?.(item, i) ?? [];
            return (
              <li
                key={i}
                draggable={!q}
                onDragStart={(e) => {
                  setDragFrom(i);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  if (dragFrom === null) return;
                  e.preventDefault();
                  setDragOver(i);
                }}
                onDragLeave={() => setDragOver((d) => (d === i ? null : d))}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragFrom !== null) move(dragFrom, i);
                  setDragFrom(null);
                  setDragOver(null);
                }}
                onDragEnd={() => {
                  setDragFrom(null);
                  setDragOver(null);
                }}
                className={`rounded-lg transition-shadow ${dragOver === i && dragFrom !== i ? "shadow-[inset_0_2px_0_var(--color-accent)]" : ""} ${dragFrom === i ? "opacity-40" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(i)}
                  aria-current={active ? "true" : undefined}
                  className={`group flex w-full items-start gap-2 rounded-lg px-2 py-2.5 text-left transition-colors ${active ? "bg-surface-2" : "hover:bg-surface-2/60"}`}
                >
                  {!q && <Icon name="grip" size={14} className="mt-0.5 cursor-grab text-muted/50 group-hover:text-muted" />}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className={`truncate text-sm ${active ? "font-medium text-ink" : "text-ink/90"}`}>{title(item) || <em className="text-muted">Untitled {noun}</em>}</span>
                      {badge?.(item)}
                    </span>
                    {meta && <span className="mt-0.5 block truncate text-xs text-muted">{meta(item)}</span>}
                  </span>
                  {problems.length > 0 && (
                    <span title={problems.join("\n")} className="mt-0.5 text-accent">
                      <Icon name="alert" size={14} />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        {items.length > 1 && !q && <p className="px-1 text-xs text-muted">Drag to reorder. Order here = order on the site.</p>}
      </div>

      {/* editor */}
      <div className="min-w-0">
        {current ? (
          <div className="rounded-xl border border-line bg-surface">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
              <p className="min-w-0 truncate text-[15px] font-semibold text-ink">{title(current) || `Untitled ${noun}`}</p>
              <div className="flex shrink-0 items-center">
                {viewHref?.(current) && (
                  <a href={viewHref(current)!} target="_blank" rel="noreferrer" aria-label="View on site" title="View on site" className={iconBtn}>
                    <Icon name="external" size={15} />
                  </a>
                )}
                <button type="button" aria-label="Move up" title="Move up" className={iconBtn} disabled={index === 0} onClick={() => move(index, index - 1)}>
                  <Icon name="up" size={15} />
                </button>
                <button type="button" aria-label="Move down" title="Move down" className={iconBtn} disabled={index === items.length - 1} onClick={() => move(index, index + 1)}>
                  <Icon name="down" size={15} />
                </button>
                <button type="button" aria-label="Duplicate" title="Duplicate" className={iconBtn} onClick={() => duplicate(index)}>
                  <Icon name="copy" size={15} />
                </button>
                <button type="button" aria-label="Delete" title="Delete" className={`${iconBtn} hover:text-accent`} onClick={() => remove(index)}>
                  <Icon name="trash" size={15} />
                </button>
              </div>
            </div>
            {(issues?.(current, index) ?? []).length > 0 && (
              <ul className="mx-5 mt-4 flex flex-col gap-1 rounded-lg border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent">
                {issues!(current, index).map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <Icon name="alert" size={14} />
                    {p}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-col gap-6 px-5 py-5">{render(current, (next) => onChange(items.map((x, j) => (j === index ? next : x))), index)}</div>
          </div>
        ) : (
          <div className="grid h-64 place-items-center rounded-xl border border-dashed border-line text-sm text-muted">
            <div className="flex flex-col items-center gap-3">
              <p>No {noun}s yet.</p>
              <button type="button" onClick={add} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[13px] text-ink hover:border-ink">
                <Icon name="plus" size={14} /> Add the first {noun}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
