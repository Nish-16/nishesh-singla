"use client";

import { useState } from "react";
import { contact } from "@/content";
import { useSiteContent } from "@/components/SiteContentProvider";
import SectionHeading from "@/components/ui/SectionHeading";
import { firebaseConfigured, sendContactMessage } from "@/lib/firebase";

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const { identity } = useSiteContent();
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(identity.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${identity.email}`;
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get("company")) return; // honeypot
    setStatus("sending");
    try {
      await sendContactMessage({
        name: String(data.get("name") ?? "").trim().slice(0, 100),
        email: String(data.get("email") ?? "").trim().slice(0, 200),
        message: String(data.get("message") ?? "").trim().slice(0, 5000),
      });
      form.reset();
      setStatus("sent");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const field =
    "w-full rounded-md border border-line bg-canvas px-3.5 py-2.5 text-ink placeholder:text-muted/60 transition-colors focus:border-accent/70 focus:outline-none focus-visible:outline-2 focus-visible:outline-accent";

  return (
    <section id="contact" aria-labelledby="contact-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6 md:py-32 md:pl-20">
      <SectionHeading id="contact" />

      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <ul className="space-y-4">
          <li>
            <div className="group flex items-stretch overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-accent/60">
              <a href={`mailto:${identity.email}`} className="flex flex-1 flex-col gap-1 p-5">
                <span className="label-mono text-[11px] text-second">{contact.labels.email}</span>
                <span className="break-all font-display text-lg text-ink sm:text-xl">{identity.email}</span>
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className="border-l border-line px-4 font-mono text-xs text-muted transition-colors hover:bg-accent/10 hover:text-accent"
              >
                <span aria-live="polite">{copied ? contact.copied : contact.copyEmail}</span>
              </button>
            </div>
          </li>
          {[
            { label: contact.labels.linkedin, href: identity.linkedin, text: identity.linkedinLabel },
            { label: contact.labels.github, href: identity.github, text: identity.githubLabel },
          ].map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent/60"
              >
                <span className="flex flex-col gap-1">
                  <span className="label-mono text-[11px] text-second">{l.label}</span>
                  <span className="font-display text-lg text-ink sm:text-xl">{l.text}</span>
                </span>
                <span aria-hidden className="font-mono text-accent">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>

        <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-line bg-surface p-5 md:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="cf-name" className="mb-1.5 block font-mono text-xs text-muted">
                {contact.form.name}
              </label>
              <input id="cf-name" name="name" required maxLength={100} autoComplete="name" className={field} />
            </div>
            <div>
              <label htmlFor="cf-email" className="mb-1.5 block font-mono text-xs text-muted">
                {contact.form.email}
              </label>
              <input id="cf-email" name="email" type="email" required maxLength={200} autoComplete="email" className={field} />
            </div>
          </div>
          <div>
            <label htmlFor="cf-message" className="mb-1.5 block font-mono text-xs text-muted">
              {contact.form.message}
            </label>
            <textarea id="cf-message" name="message" required rows={5} maxLength={5000} className={`${field} resize-y`} />
          </div>
          {/* honeypot */}
          <div aria-hidden className="hidden">
            <input name="company" tabIndex={-1} autoComplete="off" aria-hidden />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={status === "sending" || !firebaseConfigured}
              className="rounded-md border border-ink bg-ink px-5 py-2.5 font-mono text-sm font-medium text-canvas transition-colors hover:border-accent hover:bg-accent hover:text-on-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "sending" ? contact.form.sending : contact.form.submit}
            </button>
            <p role="status" className="font-mono text-xs">
              {!firebaseConfigured && <span className="text-muted">{contact.form.notConfigured}</span>}
              {status === "sent" && <span className="text-accent">{contact.form.success}</span>}
              {status === "error" && <span className="text-second">{contact.form.error}</span>}
            </p>
          </div>
        </form>
      </div>

    </section>
  );
}
