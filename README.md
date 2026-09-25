# Nishesh Singla — Portfolio

A multi-page developer portfolio. The home hero is a live 3D system-architecture graph (browser → Next.js → API/auth/functions → databases) with request/response packets flowing between services.

**Pages:** `/` (hero, about, featured work) · `/work` (experience + projects) · `/skills` (skills graph + research) · `/contact` (contact form + terminal). Press <kbd>`</kbd> on any page for the terminal (`cd work`, `projects`, `scan`, …).

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · React Three Fiber + drei + postprocessing · Framer Motion · Lenis · Firebase (Firestore, contact form)

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
- Project order in `projects` is display order; `featured: true` projects also appear on the home page.
- Deep link to a project modal with `/work#project-<slug>`.
- Skill → project links in the graph come from each project's `stack` (via `match`) plus explicit `projects` slugs.

## Before deploying

1. **Resume:** put your PDF at `public/resume.pdf` (the "Download Resume" button and `resume` terminal command point there).
2. **Site URL:** set `NEXT_PUBLIC_SITE_URL` (used by the sitemap, canonical URL, and Open Graph).
3. **Contact form (Firebase):**
   - Create a Firebase project → add a **Web app** → copy its config into the `NEXT_PUBLIC_FIREBASE_*` vars.
   - Enable **Cloud Firestore**.
   - Deploy the rules in [`firestore.rules`](firestore.rules) (Firestore → Rules, or `firebase deploy --only firestore:rules`). They allow *create-only* writes of validated messages to `messages/` and block all client reads.
   - Messages appear in the `messages` collection. For email notifications, add the "Trigger Email from Firestore" extension or a Cloud Function.
   - Without the env vars the form is disabled and asks visitors to email you directly.
4. Fill in the project GitHub/live links in `content.ts`.

## Deploy (Vercel)

1. Push to GitHub and import the repo at vercel.com/new (framework auto-detected).
2. Add the env vars from `.env.example` under Project → Settings → Environment Variables.
3. Deploy. Add your Vercel domain to Firebase → Authentication → Settings → Authorized domains if you later use Firebase Auth (not needed for Firestore writes).

## Structure

```
src/
  app/                 layout, template (page transition), / + work/ + skills/ + contact/, sitemap, robots, opengraph-image
  content.ts           all copy + data
  components/
    Providers.tsx      Lenis, scroll rail, cursor, terminal overlay
    sections/          Hero, TrafficChart, About, FeaturedWork, Experience, Projects, ProjectCard, Skills, Research, Contact, TerminalSection
    three/             HeroScene (R3F architecture graph), HeroFallback (2D canvas), XplorRoom (modal demo)
    ui/                Header (tabs), Footer, PageHeader, SectionHeading, ScrollRail, ScrambleText, MagneticButton, TiltCard, Modal, Terminal, …
  lib/                 hooks, arch graph layout, skill graph layout, scroll lock, firebase
```

## Performance & accessibility notes

- Three.js canvases load via `next/dynamic` with `ssr: false`; the hero stops rendering when off-screen and the XPLOR room renders on demand. DPR is capped at 1.5.
- On screens < 768px or with `prefers-reduced-motion`, the hero uses a lightweight 2D canvas (static under reduced motion), and the cursor ring, tilt, and magnetic effects are off.
- Modals trap focus, close on Esc, and restore focus; the terminal opens with <kbd>`</kbd> and closes with <kbd>Esc</kbd>.
