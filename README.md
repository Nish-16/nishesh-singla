# Nishesh Singla — Portfolio

A single-page developer portfolio. The hero is a live 3D system-architecture graph (browser → Next.js → API/auth/functions → databases) with request/response packets flowing between services.

**Sections:** hero · about · experience · projects · skills · research · terminal · contact. Press <kbd>`</kbd> anywhere for the terminal (`cd projects`, `whoami`, `scan`, …).

**Themes:** light (Paper & Ink) and dark (Mono + Lime). `ThemeProvider` (`useTheme()`) reads/writes `<html data-theme>`; an inline script in `layout.tsx` applies the stored choice (or the OS preference) before first paint. Colours live as CSS variables in `globals.css`, mirrored in `src/lib/theme.ts` for the canvas/three.js code. Toggle in the header or run `theme` in the terminal.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · React Three Fiber + drei · Framer Motion · Lenis · Firebase (Firestore, contact form)

## Setup

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev                  # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run lint`.

## Editing content

**All copy lives in [`src/content.ts`](src/content.ts).** Components never hard-code text.

- Project links are `null` placeholders marked `// TODO` — the modal shows "link coming soon" until you fill them in.
- IoT project readouts (`readout`, shown in the project modal) are *simulated* and labelled `SIM`.
- Project order in `projects` is display order; `featured: true` projects render as larger cards.
- Deep link to a project modal with `/#project-<slug>`.
- Skill → project links in the graph come from each project's `stack` (via `match`) plus explicit `projects` slugs.

## Before deploying

1. **Resume:** put your PDF at `public/resume.pdf` (the "Download Resume" button and `resume` terminal command point there).
2. **Site URL:** set `NEXT_PUBLIC_SITE_URL` (used by the sitemap, canonical URL, and Open Graph).
3. **Contact form (Firebase):**
   - Create a Firebase project → add a **Web app** → copy its config into the `NEXT_PUBLIC_FIREBASE_*` vars, plus `NEXT_PUBLIC_ADMIN_EMAIL`.
   - Enable **Cloud Firestore**.
   - Deploy the rules in [`firestore.rules`](firestore.rules) (Firestore → Rules, or `firebase deploy --only firestore:rules`). They allow *create-only* writes of validated messages to `messages/` and block all client reads.
   - Messages appear in the `messages` collection. For email notifications, add the "Trigger Email from Firestore" extension or a Cloud Function.
   - Without the env vars the form is disabled and asks visitors to email you directly.
4. Fill in the project GitHub/live links in `content.ts`.

## Admin (`/admin`)

A hidden dashboard (not linked anywhere, `noindex`) for editing the site without touching code: profile/about, experience, projects, skills, achievements, section intros, raw JSON (import/export), backups, and contact-form messages.

- **Storage:** all editable content is one Firestore document, `site/content` (field `data` = JSON). `src/content.ts` is the default/fallback — if the document is missing or unreadable, the site renders from code.
- **Publishing:** saving writes the document, keeps the previous version in `site_history`, then calls `/api/revalidate` (verifies your Firebase ID token) so the public page updates immediately.
- **Security:** only `NEXT_PUBLIC_ADMIN_EMAIL` can write — enforced by `firestore.rules` and the revalidate route, not by the URL being secret.

**One-time setup (Firebase console):**
1. **Authentication → Sign-in method →** enable **Email/Password**.
2. **Authentication → Users → Add user** with your admin email and a strong password.
3. **Authentication → Settings → User actions →** uncheck **Enable create (sign-up)** so nobody else can register accounts.
4. **Firestore Database →** create it, then **Rules →** paste `firestore.rules` → **Publish**.
5. Open `/admin`, sign in, click **Publish to Firestore** once to copy the current content into Firestore. After that, edit and **Save changes**.

## Deploy (Vercel)

1. Push to GitHub and import the repo at vercel.com/new (framework auto-detected).
2. Add the env vars from `.env.example` under Project → Settings → Environment Variables.
3. Deploy. Add your Vercel domain to Firebase → Authentication → Settings → Authorized domains if you later use Firebase Auth (not needed for Firestore writes).

## Structure

```
src/
  app/                 layout, page, sitemap, robots, opengraph-image
  content.ts           all copy + data
  components/
    Providers.tsx      theme, Lenis, scroll rail, terminal overlay
    sections/          Hero, TrafficChart, About, Experience, Projects, ProjectCard, Skills, Research, TerminalSection, Contact
    three/             HeroScene (R3F architecture graph), HeroFallback (2D canvas), XplorRoom (modal demo)
    ui/                Header (scroll-spy nav), ThemeToggle, Footer, SectionHeading, ScrollRail, ScrambleText, TiltCard, Modal, Terminal, …
  lib/                 hooks, arch graph layout, skill graph layout, scroll lock, firebase
```

## Performance & accessibility notes

- Three.js canvases load via `next/dynamic` with `ssr: false`; the hero stops rendering when off-screen and the XPLOR room renders on demand. DPR is capped at 1.5.
- On screens < 768px or with `prefers-reduced-motion`, the hero uses a lightweight 2D canvas (static under reduced motion), and card tilt is off. Cursors are plain CSS (themed SVG wedge pointer / serif I-beam in `globals.css`), so text selection stays native.
- Modals trap focus, close on Esc, and restore focus; the terminal opens with <kbd>`</kbd> and closes with <kbd>Esc</kbd>.
