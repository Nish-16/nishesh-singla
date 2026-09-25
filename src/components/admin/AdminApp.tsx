"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { User } from "firebase/auth";
import { ADMIN_EMAIL, firebaseConfigured, getDb, getFirebaseAuth } from "@/lib/firebase";
import { CONTENT_COLLECTION, CONTENT_DOC, HISTORY_COLLECTION, defaultContent, mergeContent, parseContentJson, type SiteContent } from "@/lib/siteContent";
import { useTheme } from "@/components/ThemeProvider";
import { AchievementsEditor, ExperienceEditor, IntrosEditor, ProfileEditor, ProjectsEditor, SkillsEditor, findIssues, type TabId } from "./editors";
import { Card } from "./fields";
import { Icon, type IconName } from "./icons";
import { ToastProvider, useToast } from "./toast";

// ---------------------------------------------------------------------------
// Auth gate
// ---------------------------------------------------------------------------

type AuthState = { status: "loading" } | { status: "signed-out" } | { status: "denied"; user: User } | { status: "admin"; user: User };

const isAdminUser = (u: User) => !!ADMIN_EMAIL && u.email?.toLowerCase() === ADMIN_EMAIL;

export default function AdminApp() {
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    if (!firebaseConfigured) return;
    let unsub = () => {};
    getFirebaseAuth().then(async (a) => {
      const { onAuthStateChanged } = await import("firebase/auth");
      unsub = onAuthStateChanged(a, (u) => setAuth(!u ? { status: "signed-out" } : isAdminUser(u) ? { status: "admin", user: u } : { status: "denied", user: u }));
    });
    return () => unsub();
  }, []);

  const signOut = async () => {
    const [a, { signOut: out }] = await Promise.all([getFirebaseAuth(), import("firebase/auth")]);
    await out(a);
  };

  if (!firebaseConfigured || !ADMIN_EMAIL) {
    return <Centered title="Admin isn't configured">Set the NEXT_PUBLIC_FIREBASE_* variables and NEXT_PUBLIC_ADMIN_EMAIL, then restart the server.</Centered>;
  }
  if (auth.status === "loading") return <Centered title="Loading…" />;
  if (auth.status === "signed-out") return <SignInForm />;
  if (auth.status === "denied") {
    return (
      <Centered title="Not authorised">
        <p className="text-sm text-muted">{auth.user.email} can&apos;t access this page.</p>
        <button type="button" onClick={signOut} className="mt-4 rounded-lg border border-line px-4 py-2 text-sm text-ink hover:border-ink">
          Sign out
        </button>
      </Centered>
    );
  }
  return (
    <ToastProvider>
      <Dashboard user={auth.user} onSignOut={signOut} />
    </ToastProvider>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

const TABS: { id: TabId; label: string; icon: IconName; title: string; description: string }[] = [
  { id: "profile", label: "Profile", icon: "user", title: "Profile & About", description: "Your name, tagline, bio, stats and links." },
  { id: "experience", label: "Experience", icon: "briefcase", title: "Experience", description: "Roles on the timeline, newest first." },
  { id: "projects", label: "Projects", icon: "folder", title: "Projects", description: "Cards in the projects grid. Featured ones show larger." },
  { id: "skills", label: "Skills", icon: "layers", title: "Skills", description: "Skill groups and what links them to projects in the graph." },
  { id: "achievements", label: "Achievements", icon: "award", title: "Research & achievements", description: "Patents, rankings and awards." },
  { id: "intros", label: "Section intros", icon: "text", title: "Section intros", description: "The large line under each section heading." },
  { id: "json", label: "JSON & backups", icon: "braces", title: "JSON & backups", description: "Edit everything as JSON, download a copy, or restore a previous version." },
  { id: "messages", label: "Messages", icon: "inbox", title: "Messages", description: "Submissions from the contact form." },
];

type Selection = Record<"experience" | "projects" | "skills" | "achievements", number>;

export function Dashboard({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const toast = useToast();
  const [tab, setTab] = useState<TabId>("profile");
  const [selection, setSelection] = useState<Selection>({ experience: 0, projects: 0, skills: 0, achievements: 0 });
  const [content, setContent] = useState<SiteContent | null>(null);
  const [savedJson, setSavedJson] = useState("");
  const [fromDefaults, setFromDefaults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [db, { doc, getDoc }] = await Promise.all([getDb(), import("firebase/firestore")]);
        const snap = await getDoc(doc(db, CONTENT_COLLECTION, CONTENT_DOC));
        if (cancelled) return;
        const data = snap.exists() ? parseContentJson(String(snap.data().data ?? "")) : defaultContent;
        setFromDefaults(!snap.exists());
        setContent(data);
        setSavedJson(JSON.stringify(data));
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const json = useMemo(() => (content ? JSON.stringify(content) : ""), [content]);
  const dirty = !!content && json !== savedJson;
  const needsSave = dirty || fromDefaults;
  const issues = useMemo(() => (content ? findIssues(content) : []), [content]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = useCallback(async () => {
    if (!content || saving) return;
    if (issues.length) {
      toast({ message: `Fix ${issues.length} issue${issues.length === 1 ? "" : "s"} before saving.`, tone: "error" });
      return;
    }
    setSaving(true);
    try {
      const [db, fs] = await Promise.all([getDb(), import("firebase/firestore")]);
      const ref = fs.doc(db, CONTENT_COLLECTION, CONTENT_DOC);
      const prev = await fs.getDoc(ref);
      if (prev.exists()) await fs.addDoc(fs.collection(db, HISTORY_COLLECTION), { data: prev.data().data, savedAt: fs.serverTimestamp(), by: user.email });
      const data = JSON.stringify(content);
      await fs.setDoc(ref, { data, updatedAt: fs.serverTimestamp(), updatedBy: user.email });
      setSavedJson(data);
      setFromDefaults(false);
      setSavedAt(new Date());

      const token = await user.getIdToken();
      const res = await fetch("/api/revalidate", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      toast(
        res.ok
          ? { message: "Saved. The live site is updated.", tone: "success" }
          : { message: "Saved, but the site refresh failed. It will update within the hour.", tone: "error", duration: 8000 },
      );
    } catch (e) {
      toast({ message: `Save failed: ${e instanceof Error ? e.message : String(e)}`, tone: "error", duration: 10000 });
    } finally {
      setSaving(false);
    }
  }, [content, saving, issues.length, toast, user]);

  // Ctrl/Cmd + S
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const discard = () => {
    setContent(JSON.parse(savedJson) as SiteContent);
    toast({ message: "Changes discarded." });
  };

  const jumpTo = (tabId: TabId, index: number) => {
    setTab(tabId);
    if (tabId in selection) setSelection((s) => ({ ...s, [tabId]: index }));
  };

  const set =
    <K extends keyof SiteContent>(key: K) =>
    (v: SiteContent[K]) =>
      setContent((c) => (c ? { ...c, [key]: v } : c));
  const select = (key: keyof Selection) => (i: number) => setSelection((s) => ({ ...s, [key]: i }));

  const counts: Partial<Record<TabId, number>> = content
    ? { experience: content.experience.length, projects: content.projects.length, skills: content.skillGroups.length, achievements: content.achievements.length }
    : {};
  const current = TABS.find((t) => t.id === tab)!;

  return (
    <div className="min-h-screen bg-canvas md:grid md:grid-cols-[232px_1fr]">
      <Sidebar tab={tab} onTab={setTab} counts={counts} issues={issues.map((i) => i.tab)} user={user} onSignOut={onSignOut} />

      <main className="min-w-0 px-4 pb-32 pt-5 sm:px-5 md:pt-6">
        <div className="mx-auto max-w-[1440px]">
          <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">{current.title}</h1>
              <p className="mt-1 text-sm text-muted">{current.description}</p>
            </div>
            <p className="font-mono text-xs text-muted">
              {!content ? "" : needsSave ? "" : savedAt ? `saved ${savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "up to date"}
            </p>
          </header>

          {fromDefaults && tab !== "messages" && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted">
              <Icon name="alert" className="mt-0.5 text-accent" />
              <p>
                Nothing is stored in Firestore yet, so you&apos;re seeing the defaults from <code className="font-mono text-ink">content.ts</code>. Press{" "}
                <b className="text-ink">Publish</b> once to start editing live.
              </p>
            </div>
          )}
          {loadError && (
            <div className="mb-6 rounded-xl border border-accent/50 px-4 py-3 text-sm text-accent">Couldn&apos;t load content: {loadError}</div>
          )}
          {!content && !loadError && tab !== "messages" && <Skeleton />}

          {content && tab === "profile" && <ProfileEditor value={content} onChange={setContent} />}
          {content && tab === "experience" && (
            <ExperienceEditor value={content.experience} onChange={set("experience")} selected={selection.experience} onSelect={select("experience")} />
          )}
          {content && tab === "projects" && (
            <ProjectsEditor value={content.projects} onChange={set("projects")} selected={selection.projects} onSelect={select("projects")} />
          )}
          {content && tab === "skills" && <SkillsEditor value={content.skillGroups} onChange={set("skillGroups")} selected={selection.skills} onSelect={select("skills")} />}
          {content && tab === "achievements" && (
            <AchievementsEditor value={content.achievements} onChange={set("achievements")} selected={selection.achievements} onSelect={select("achievements")} />
          )}
          {content && tab === "intros" && <IntrosEditor value={content.sectionIntros} onChange={set("sectionIntros")} />}
          {content && tab === "json" && <JsonPanel content={content} onApply={setContent} />}
          {tab === "messages" && <MessagesPanel />}
        </div>
      </main>

      {content && needsSave && (
        <SaveBar
          saving={saving}
          fromDefaults={fromDefaults && !dirty}
          dirty={dirty}
          issues={issues}
          onSave={save}
          onDiscard={discard}
          onJump={(i) => jumpTo(i.tab, i.index)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chrome: sidebar + save bar
// ---------------------------------------------------------------------------

function Sidebar({
  tab,
  onTab,
  counts,
  issues,
  user,
  onSignOut,
}: {
  tab: TabId;
  onTab: (t: TabId) => void;
  counts: Partial<Record<TabId, number>>;
  issues: TabId[];
  user: User;
  onSignOut: () => void;
}) {
  const { theme, toggleTheme } = useTheme();
  return (
    <aside className="border-b border-line bg-surface md:sticky md:top-0 md:flex md:h-screen md:flex-col md:border-b-0 md:border-r">
      <div className="flex items-center justify-between px-5 py-4 md:py-5">
        <div>
          <p className="font-display text-[15px] font-semibold text-ink">Nishesh Singla</p>
          <p className="font-mono text-[11px] text-muted">admin</p>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted hover:bg-surface-2 hover:text-ink">
          Site <Icon name="external" size={12} />
        </a>
      </div>

      <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:overflow-visible md:pb-0">
        {TABS.map((t, i) => {
          const active = tab === t.id;
          const hasIssue = issues.includes(t.id);
          return (
            <div key={t.id} className="contents">
              {i === 6 && <div className="my-2 hidden border-t border-line md:block" />}
              <button
                type="button"
                onClick={() => onTab(t.id)}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${
                  active ? "bg-surface-2 font-medium text-ink" : "text-muted hover:bg-surface-2/60 hover:text-ink"
                }`}
              >
                <Icon name={t.icon} size={15} className={active ? "text-accent" : ""} />
                <span className="flex-1 whitespace-nowrap">{t.label}</span>
                {hasIssue && <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-label="has issues" />}
                {counts[t.id] !== undefined && <span className="font-mono text-[11px] text-muted">{counts[t.id]}</span>}
              </button>
            </div>
          );
        })}
      </nav>

      <div className="hidden border-t border-line px-3 py-3 md:block">
        <p className="truncate px-2 pb-2 text-xs text-muted" title={user.email ?? ""}>
          {user.email}
        </p>
        <div className="flex gap-1">
          <button type="button" onClick={toggleTheme} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs text-muted hover:bg-surface-2 hover:text-ink">
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button type="button" onClick={onSignOut} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs text-muted hover:bg-surface-2 hover:text-ink">
            <Icon name="logout" size={13} /> Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}

function SaveBar({
  saving,
  fromDefaults,
  dirty,
  issues,
  onSave,
  onDiscard,
  onJump,
}: {
  saving: boolean;
  fromDefaults: boolean;
  dirty: boolean;
  issues: ReturnType<typeof findIssues>;
  onSave: () => void;
  onDiscard: () => void;
  onJump: (i: ReturnType<typeof findIssues>[number]) => void;
}) {
  const [showIssues, setShowIssues] = useState(false);
  const blocked = issues.length > 0;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 md:left-[232px]">
      <div className="pointer-events-auto relative flex w-full max-w-2xl items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-xl shadow-black/25">
        {blocked ? (
          <button type="button" onClick={() => setShowIssues((v) => !v)} className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm text-accent">
            <Icon name="alert" size={15} />
            <span className="truncate">
              {issues.length} issue{issues.length === 1 ? "" : "s"} to fix before saving
            </span>
            <Icon name={showIssues ? "down" : "up"} size={14} />
          </button>
        ) : (
          <p className="flex min-w-0 flex-1 items-center gap-2 text-sm text-ink">
            <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
            <span className="truncate">{fromDefaults ? "Publish the current content to Firestore" : "Unsaved changes"}</span>
          </p>
        )}
        {dirty && (
          <button type="button" onClick={onDiscard} disabled={saving} className="rounded-lg px-3 py-2 text-[13px] text-muted hover:bg-surface-2 hover:text-ink">
            Discard
          </button>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={saving || blocked}
          className="inline-flex items-center gap-2 rounded-lg border border-ink bg-ink px-4 py-2 text-[13px] font-medium text-canvas transition-colors hover:border-accent hover:bg-accent hover:text-on-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Saving…" : fromDefaults ? "Publish" : "Save"}
          <kbd className="hidden rounded border border-canvas/30 px-1 font-mono text-[10px] opacity-70 sm:inline">Ctrl S</kbd>
        </button>

        {blocked && showIssues && (
          <ul className="absolute bottom-full left-0 right-0 mb-2 max-h-64 overflow-y-auto rounded-xl border border-line bg-surface p-1.5 shadow-xl shadow-black/25">
            {issues.map((i, k) => (
              <li key={k}>
                <button
                  type="button"
                  onClick={() => {
                    onJump(i);
                    setShowIssues(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-surface-2"
                >
                  <span className="truncate">{i.message}</span>
                  <span className="shrink-0 font-mono text-[11px] text-muted">go →</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-40 animate-pulse rounded-xl border border-line bg-surface" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// JSON & backups
// ---------------------------------------------------------------------------

const ghostBtn = "inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[13px] text-ink transition-colors hover:border-ink";

function JsonPanel({ content, onApply }: { content: SiteContent; onApply: (c: SiteContent) => void }) {
  const toast = useToast();
  const current = JSON.stringify(content, null, 2);
  const [draft, setDraft] = useState(current);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ id: string; savedAt: string; by: string; data: string }[] | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const apply = () => {
    try {
      onApply(mergeContent(JSON.parse(draft)));
      setError(null);
      toast({ message: "JSON applied to the editor. Save to publish.", tone: "success" });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const download = () => {
    const blob = new Blob([current], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `site-content-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const [db, fs] = await Promise.all([getDb(), import("firebase/firestore")]);
      const snap = await fs.getDocs(fs.query(fs.collection(db, HISTORY_COLLECTION), fs.orderBy("savedAt", "desc"), fs.limit(20)));
      setHistory(
        snap.docs.map((d) => ({
          id: d.id,
          savedAt: d.data().savedAt?.toDate?.().toLocaleString() ?? "—",
          by: String(d.data().by ?? ""),
          data: String(d.data().data ?? ""),
        })),
      );
    } catch (e) {
      toast({ message: `Couldn't load backups: ${e instanceof Error ? e.message : String(e)}`, tone: "error" });
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Card
        title="Raw JSON"
        description="Everything at once, including fields without a form (like IoT readouts). Apply loads it into the editor; saving publishes it."
        aside={
          <button type="button" className={ghostBtn} onClick={download}>
            <Icon name="download" size={14} /> Download
          </button>
        }
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck={false}
          rows={22}
          data-lenis-prevent
          className="scrollbar-thin w-full rounded-lg border border-line bg-canvas p-3 font-mono text-xs leading-relaxed text-ink focus:border-ink focus:outline-none"
        />
        {error && <p className="font-mono text-xs text-accent">Invalid JSON: {error}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="button" className={ghostBtn} onClick={apply} disabled={draft === current}>
            <Icon name="check" size={14} /> Apply to editor
          </button>
          <button type="button" className={ghostBtn} onClick={() => setDraft(current)} disabled={draft === current}>
            <Icon name="undo" size={14} /> Revert textarea
          </button>
          <button
            type="button"
            className={`${ghostBtn} ml-auto hover:border-accent hover:text-accent`}
            onClick={() => {
              if (window.confirm("Replace the editor with the defaults from content.ts? You still need to save.")) {
                onApply(defaultContent);
                setDraft(JSON.stringify(defaultContent, null, 2));
              }
            }}
          >
            Reset to code defaults
          </button>
        </div>
      </Card>

      <Card
        title="Backups"
        description="A copy of the previous version is kept every time you save."
        aside={
          <button type="button" className={ghostBtn} onClick={loadHistory} disabled={loadingHistory}>
            <Icon name="history" size={14} /> {history ? "Refresh" : loadingHistory ? "Loading…" : "Load backups"}
          </button>
        }
      >
        {!history ? (
          <p className="text-sm text-muted">Load the list to restore an earlier version.</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted">No backups yet. One is created on your next save.</p>
        ) : (
          <ul className="-my-2 divide-y divide-line">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-3 py-2.5">
                <span>
                  <span className="block text-sm text-ink">{h.savedAt}</span>
                  {h.by && <span className="block text-xs text-muted">{h.by}</span>}
                </span>
                <button
                  type="button"
                  className={ghostBtn}
                  onClick={() => {
                    onApply(parseContentJson(h.data));
                    setDraft(JSON.stringify(parseContentJson(h.data), null, 2));
                    toast({ message: `Restored the backup from ${h.savedAt}. Save to publish it.`, tone: "success", duration: 8000 });
                  }}
                >
                  <Icon name="undo" size={14} /> Restore
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

type Msg = { id: string; name: string; email: string; message: string; createdAt: Date | null };

function MessagesPanel() {
  const toast = useToast();
  const [messages, setMessages] = useState<Msg[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [db, fs] = await Promise.all([getDb(), import("firebase/firestore")]);
        const snap = await fs.getDocs(fs.query(fs.collection(db, "messages"), fs.orderBy("createdAt", "desc"), fs.limit(100)));
        if (cancelled) return;
        setMessages(
          snap.docs.map((d) => ({
            id: d.id,
            name: String(d.data().name ?? ""),
            email: String(d.data().email ?? ""),
            message: String(d.data().message ?? ""),
            createdAt: d.data().createdAt?.toDate?.() ?? null,
          })),
        );
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const remove = async (m: Msg) => {
    if (!window.confirm(`Delete the message from ${m.name}? This can't be undone.`)) return;
    try {
      const [db, fs] = await Promise.all([getDb(), import("firebase/firestore")]);
      await fs.deleteDoc(fs.doc(db, "messages", m.id));
      setMessages((list) => list?.filter((x) => x.id !== m.id) ?? null);
      toast({ message: "Message deleted.", tone: "success" });
    } catch (e) {
      toast({ message: `Couldn't delete: ${e instanceof Error ? e.message : String(e)}`, tone: "error" });
    }
  };

  if (error) return <div className="rounded-xl border border-accent/50 px-4 py-3 text-sm text-accent">Couldn&apos;t load messages: {error}</div>;
  if (!messages) return <Skeleton />;
  if (!messages.length)
    return (
      <div className="grid h-56 place-items-center rounded-xl border border-dashed border-line text-center text-sm text-muted">
        <div className="flex flex-col items-center gap-2">
          <Icon name="inbox" size={22} />
          No messages yet. Submissions from the contact form will appear here.
        </div>
      </div>
    );
  return (
    <ul className="flex flex-col gap-3">
      {messages.map((m) => (
        <li key={m.id} className="rounded-xl border border-line bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 font-medium text-ink">{(m.name[0] ?? "?").toUpperCase()}</span>
              <div>
                <p className="text-sm font-medium text-ink">{m.name}</p>
                <a href={`mailto:${m.email}`} className="text-xs text-muted hover:text-ink">
                  {m.email}
                </a>
              </div>
            </div>
            <time className="font-mono text-[11px] text-muted" dateTime={m.createdAt?.toISOString()}>
              {m.createdAt ? m.createdAt.toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—"}
            </time>
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink/90">{m.message}</p>
          <div className="mt-4 flex gap-2">
            <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message")}`} className={ghostBtn}>
              <Icon name="mail" size={14} /> Reply
            </a>
            <button type="button" onClick={() => remove(m)} className={`${ghostBtn} hover:border-accent hover:text-accent`}>
              <Icon name="trash" size={14} /> Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Sign in
// ---------------------------------------------------------------------------

const AUTH_ERRORS: Record<string, string> = {
  "auth/invalid-credential": "Wrong email or password.",
  "auth/invalid-email": "That email address isn't valid.",
  "auth/too-many-requests": "Too many attempts. Wait a bit, or reset your password.",
  "auth/network-request-failed": "Network error. Check your connection.",
  "auth/operation-not-allowed": "Email/password sign-in isn't enabled in Firebase Authentication.",
};

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const message = (e: unknown) => {
    const code = (e as { code?: string })?.code ?? "";
    return AUTH_ERRORS[code] ?? (e instanceof Error ? e.message : String(e));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const [a, { signInWithEmailAndPassword }] = await Promise.all([getFirebaseAuth(), import("firebase/auth")]);
      await signInWithEmailAndPassword(a, email.trim(), password);
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
    }
  };

  const onReset = async () => {
    if (!email.trim()) {
      setError("Enter your email first, then click reset.");
      return;
    }
    setError(null);
    try {
      const [a, { sendPasswordResetEmail }] = await Promise.all([getFirebaseAuth(), import("firebase/auth")]);
      await sendPasswordResetEmail(a, email.trim());
      setNotice("If that account exists, a reset link is on its way.");
    } catch (err) {
      setError(message(err));
    }
  };

  const field =
    "h-11 w-full rounded-lg border border-line bg-canvas px-3 text-sm text-ink focus:border-ink focus:outline-none focus:ring-2 focus:ring-accent/20";
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-5 rounded-2xl border border-line bg-surface p-7">
        <div>
          <p className="font-mono text-[11px] text-muted">nishesh singla</p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">Sign in to admin</h1>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-ink">Email</span>
          <input type="email" autoComplete="username" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="flex items-center justify-between text-[13px] font-medium text-ink">
            Password
            <button type="button" onClick={onReset} className="text-xs font-normal text-muted hover:text-ink">
              Forgot?
            </button>
          </span>
          <span className="relative">
            <input
              type={show ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${field} pr-16`}
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-muted hover:text-ink">
              {show ? "Hide" : "Show"}
            </button>
          </span>
        </label>
        {error && (
          <p role="alert" className="flex items-center gap-2 text-sm text-accent">
            <Icon name="alert" size={14} /> {error}
          </p>
        )}
        {notice && <p className="text-sm text-muted">{notice}</p>}
        <button
          type="submit"
          disabled={busy}
          className="h-11 rounded-lg border border-ink bg-ink text-sm font-medium text-canvas transition-colors hover:border-accent hover:bg-accent hover:text-on-accent disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function Centered({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="flex max-w-sm flex-col items-center gap-2 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
        {children}
      </div>
    </div>
  );
}
