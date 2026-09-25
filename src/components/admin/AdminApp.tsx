"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { User } from "firebase/auth";
import { ADMIN_EMAIL, firebaseConfigured, getDb, getFirebaseAuth } from "@/lib/firebase";
import {
  CONTENT_COLLECTION,
  CONTENT_DOC,
  HISTORY_COLLECTION,
  defaultContent,
  mergeContent,
  parseContentJson,
  type SiteContent,
} from "@/lib/siteContent";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { AchievementsEditor, ExperienceEditor, IntrosEditor, ProfileEditor, ProjectsEditor, SkillsEditor } from "./editors";

type Tab = "profile" | "experience" | "projects" | "skills" | "achievements" | "intros" | "json" | "messages";
const TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile & About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "achievements", label: "Achievements" },
  { id: "intros", label: "Section intros" },
  { id: "json", label: "JSON & backups" },
  { id: "messages", label: "Messages" },
];

type AuthState = { status: "loading" } | { status: "signed-out" } | { status: "denied"; user: User } | { status: "admin"; user: User };

const isAdminUser = (u: User) => !!ADMIN_EMAIL && u.email?.toLowerCase() === ADMIN_EMAIL;

export default function AdminApp() {
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    if (!firebaseConfigured) return;
    let unsub = () => {};
    getFirebaseAuth().then(async (a) => {
      const { onAuthStateChanged } = await import("firebase/auth");
      unsub = onAuthStateChanged(a, (u) =>
        setAuth(!u ? { status: "signed-out" } : isAdminUser(u) ? { status: "admin", user: u } : { status: "denied", user: u }),
      );
    });
    return () => unsub();
  }, []);

  const signOut = async () => {
    const [a, { signOut: out }] = await Promise.all([getFirebaseAuth(), import("firebase/auth")]);
    await out(a);
  };

  if (!firebaseConfigured || !ADMIN_EMAIL) {
    return (
      <Centered title="Admin isn't configured">
        Set the NEXT_PUBLIC_FIREBASE_* variables and NEXT_PUBLIC_ADMIN_EMAIL, then restart the server.
      </Centered>
    );
  }
  if (auth.status === "loading") return <Centered title="Loading…" />;
  if (auth.status === "signed-out") return <SignInForm />;
  if (auth.status === "denied") {
    return (
      <Centered title="Not authorised">
        <p className="text-muted">{auth.user.email} can&apos;t access this page.</p>
        <button type="button" onClick={signOut} className="mt-4 rounded-md border border-line px-4 py-2 font-mono text-sm text-ink hover:border-ink">
          Sign out
        </button>
      </Centered>
    );
  }
  return <Dashboard user={auth.user} onSignOut={signOut} />;
}

// ---------------------------------------------------------------------------

type SaveState = { kind: "idle" } | { kind: "saving" } | { kind: "saved"; at: Date; live: boolean } | { kind: "error"; message: string };

function Dashboard({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [tab, setTab] = useState<Tab>("profile");
  const [content, setContent] = useState<SiteContent | null>(null);
  const [savedJson, setSavedJson] = useState("");
  const [fromDefaults, setFromDefaults] = useState(false);
  const [save, setSave] = useState<SaveState>({ kind: "idle" });
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
        setSavedJson(snap.exists() ? JSON.stringify(data) : "");
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dirty = useMemo(() => !!content && JSON.stringify(content) !== savedJson, [content, savedJson]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const onSave = async () => {
    if (!content) return;
    setSave({ kind: "saving" });
    try {
      const [db, fs] = await Promise.all([getDb(), import("firebase/firestore")]);
      const ref = fs.doc(db, CONTENT_COLLECTION, CONTENT_DOC);
      const prev = await fs.getDoc(ref);
      if (prev.exists()) {
        await fs.addDoc(fs.collection(db, HISTORY_COLLECTION), {
          data: prev.data().data,
          savedAt: fs.serverTimestamp(),
          by: user.email,
        });
      }
      const json = JSON.stringify(content);
      await fs.setDoc(ref, {
        data: json,
        updatedAt: fs.serverTimestamp(),
        updatedBy: user.email,
      });
      setSavedJson(json);
      setFromDefaults(false);

      // Refresh the public site's cached copy.
      const token = await user.getIdToken();
      const res = await fetch("/api/revalidate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSave({ kind: "saved", at: new Date(), live: res.ok });
    } catch (e) {
      setSave({
        kind: "error",
        message: e instanceof Error ? e.message : String(e),
      });
    }
  };

  const set =
    <K extends keyof SiteContent>(key: K) =>
    (v: SiteContent[K]) =>
      setContent((c) => (c ? { ...c, [key]: v } : c));

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="font-display text-base font-semibold text-ink">Admin</span>
            <a href="/" target="_blank" rel="noreferrer" className="font-mono text-xs text-muted hover:text-ink">
              view site ↗
            </a>
          </div>
          <div className="flex items-center gap-3">
            <SaveStatus state={save} dirty={dirty} />
            <button
              type="button"
              onClick={onSave}
              disabled={!content || save.kind === "saving" || (!dirty && !fromDefaults)}
              className="rounded-md border border-ink bg-ink px-4 py-2 font-mono text-xs text-canvas transition-colors hover:border-accent hover:bg-accent hover:text-on-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              {save.kind === "saving" ? "Saving…" : fromDefaults ? "Publish to Firestore" : "Save changes"}
            </button>
            <ThemeToggle />
            <button type="button" onClick={onSignOut} title={user.email ?? ""} className="font-mono text-xs text-muted hover:text-ink">
              sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[200px_1fr]">
        <nav aria-label="Sections" className="flex gap-1 overflow-x-auto md:flex-col">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? "page" : undefined}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-left font-mono text-xs transition-colors ${
                tab === t.id ? "bg-surface-2 text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <main className="min-w-0 pb-24">
          {fromDefaults && tab !== "messages" && (
            <p className="mb-5 rounded-md border border-line bg-surface px-4 py-3 text-sm text-muted">
              Nothing is stored in Firestore yet, so this shows the defaults from <code>content.ts</code>. Click <b>Publish to Firestore</b> once to
              start editing live.
            </p>
          )}
          {loadError && (
            <p className="mb-5 rounded-md border border-accent/50 px-4 py-3 text-sm text-accent">Couldn&apos;t load content: {loadError}</p>
          )}
          {!content && !loadError && <p className="text-muted">Loading content…</p>}
          {content && tab === "profile" && <ProfileEditor value={content} onChange={setContent} />}
          {content && tab === "experience" && <ExperienceEditor value={content.experience} onChange={set("experience")} />}
          {content && tab === "projects" && <ProjectsEditor value={content.projects} onChange={set("projects")} />}
          {content && tab === "skills" && <SkillsEditor value={content.skillGroups} onChange={set("skillGroups")} />}
          {content && tab === "achievements" && <AchievementsEditor value={content.achievements} onChange={set("achievements")} />}
          {content && tab === "intros" && <IntrosEditor value={content.sectionIntros} onChange={set("sectionIntros")} />}
          {content && tab === "json" && <JsonPanel content={content} onApply={setContent} />}
          {tab === "messages" && <MessagesPanel />}
        </main>
      </div>
    </div>
  );
}

function SaveStatus({ state, dirty }: { state: SaveState; dirty: boolean }) {
  if (state.kind === "error")
    return (
      <span className="max-w-xs truncate font-mono text-xs text-accent" title={state.message}>
        save failed: {state.message}
      </span>
    );
  if (dirty) return <span className="font-mono text-xs text-accent">● unsaved changes</span>;
  if (state.kind === "saved")
    return (
      <span className="font-mono text-xs text-muted">
        saved {state.at.toLocaleTimeString()}
        {state.live ? " · site updated" : " · site refresh failed (will update within the hour)"}
      </span>
    );
  return null;
}

// ---------------------------------------------------------------------------

function JsonPanel({ content, onApply }: { content: SiteContent; onApply: (c: SiteContent) => void }) {
  const current = JSON.stringify(content, null, 2);
  const [draft, setDraft] = useState(current);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ id: string; savedAt: string; data: string }[] | null>(null);

  const apply = () => {
    try {
      onApply(mergeContent(JSON.parse(draft)));
      setError(null);
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
    const [db, fs] = await Promise.all([getDb(), import("firebase/firestore")]);
    const snap = await fs.getDocs(fs.query(fs.collection(db, HISTORY_COLLECTION), fs.orderBy("savedAt", "desc"), fs.limit(15)));
    setHistory(
      snap.docs.map((d) => ({
        id: d.id,
        savedAt: d.data().savedAt?.toDate?.().toLocaleString() ?? "—",
        data: String(d.data().data ?? ""),
      })),
    );
  };

  const btn = "rounded-md border border-line px-3 py-1.5 font-mono text-xs text-ink hover:border-ink";
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="font-display text-lg font-semibold text-ink">Raw JSON</h3>
        <p className="text-sm text-muted">
          Edit everything at once (including fields without a form, like IoT readouts). Apply loads it into the editor; you still need to save.
        </p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck={false}
          rows={24}
          className="w-full rounded-md border border-line bg-canvas p-3 font-mono text-xs text-ink focus:border-ink focus:outline-none"
        />
        {error && <p className="font-mono text-xs text-accent">Invalid JSON: {error}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btn} onClick={apply}>
            Apply JSON
          </button>
          <button type="button" className={btn} onClick={() => setDraft(current)}>
            Revert textarea
          </button>
          <button type="button" className={btn} onClick={download}>
            Download backup
          </button>
          <button
            type="button"
            className={btn}
            onClick={() => {
              if (window.confirm("Replace the editor with the defaults from content.ts? (You still need to save.)")) onApply(defaultContent);
            }}
          >
            Reset to code defaults
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-display text-lg font-semibold text-ink">Backups</h3>
        <p className="text-sm text-muted">A copy of the previous version is kept every time you save.</p>
        {!history ? (
          <button type="button" className={`${btn} w-fit`} onClick={loadHistory}>
            Load recent backups
          </button>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted">No backups yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <span className="font-mono text-xs text-muted">{h.savedAt}</span>
                <button
                  type="button"
                  className={btn}
                  onClick={() => {
                    if (window.confirm(`Load the backup from ${h.savedAt} into the editor? (You still need to save.)`))
                      onApply(parseContentJson(h.data));
                  }}
                >
                  Restore into editor
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------

type Msg = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

function MessagesPanel() {
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
            createdAt: d.data().createdAt?.toDate?.().toLocaleString() ?? "—",
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
    if (!window.confirm(`Delete the message from ${m.name}?`)) return;
    const [db, fs] = await Promise.all([getDb(), import("firebase/firestore")]);
    await fs.deleteDoc(fs.doc(db, "messages", m.id));
    setMessages((list) => list?.filter((x) => x.id !== m.id) ?? null);
  };

  if (error) return <p className="text-sm text-accent">Couldn&apos;t load messages: {error}</p>;
  if (!messages) return <p className="text-muted">Loading messages…</p>;
  if (!messages.length) return <p className="text-muted">No messages yet.</p>;
  return (
    <ul className="flex flex-col gap-3">
      {messages.map((m) => (
        <li key={m.id} className="rounded-lg border border-line bg-surface p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm text-ink">
              <b>{m.name}</b>{" "}
              <a href={`mailto:${m.email}`} className="font-mono text-xs text-muted hover:text-ink">
                {m.email}
              </a>
            </p>
            <span className="font-mono text-[11px] text-muted">{m.createdAt}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink/85">{m.message}</p>
          <div className="mt-3 flex gap-2">
            <a
              href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message")}`}
              className="rounded-md border border-line px-3 py-1.5 font-mono text-xs text-ink hover:border-ink"
            >
              Reply
            </a>
            <button
              type="button"
              onClick={() => remove(m)}
              className="rounded-md border border-line px-3 py-1.5 font-mono text-xs text-muted hover:border-accent hover:text-accent"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

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

  const field = "w-full rounded-md border border-line bg-canvas px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none";
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-line bg-surface p-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Admin</h1>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted">Email</span>
          <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
          />
        </label>
        {error && <p className="text-sm text-accent">{error}</p>}
        {notice && <p className="text-sm text-muted">{notice}</p>}
        <button
          type="submit"
          disabled={busy}
          className="rounded-md border border-ink bg-ink px-5 py-2.5 font-mono text-sm text-canvas transition-colors hover:border-accent hover:bg-accent hover:text-on-accent disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <button type="button" onClick={onReset} className="self-start font-mono text-xs text-muted hover:text-ink">
          Forgot password?
        </button>
      </form>
    </div>
  );
}

function Centered({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="flex max-w-sm flex-col items-center gap-2 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
        {children}
      </div>
    </div>
  );
}
