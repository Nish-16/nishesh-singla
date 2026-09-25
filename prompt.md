# Nishesh Singla — Portfolio Build Prompt + Content

Two parts:
1. **The build prompt** — paste into Claude Code, Cursor, v0, Lovable, or Bolt.
2. **The content** — the merged, cleaned copy from all four resumes. Paste it right after the prompt, or save it as `content.ts` in the repo.

---

## PART 1 — BUILD PROMPT

```
You are a senior creative developer. Build a personal portfolio website for Nishesh Singla, an Electrical & Computer Engineering student (Thapar Institute, 2027) who builds full-stack web apps AND embedded/IoT hardware. The site should feel memorable and interactive, but load fast and stay readable. The theme comes from his identity: he works where hardware signals meet software.

## Tech stack
- Next.js 14+ (App Router) + TypeScript
- Tailwind CSS
- React Three Fiber + @react-three/drei for 3D (plus @react-three/postprocessing for a subtle bloom)
- Framer Motion for UI animation
- Lenis for smooth scrolling
- All content comes from a single typed file `src/content.ts` (I'm giving you the content below). No hard-coded copy inside components.
- Deploy target: Vercel.

## Creative concept: "Signal Path"
The site is a living circuit board. A signal travels from the hero down through the page, and each section is a component on the board that the signal powers up.

### Hero (Three.js)
- Full-screen 3D scene: a dark PCB surface viewed at an angle, with copper traces running across it and a central microcontroller chip (ESP32-style, NOT a real brand logo) with his initials "NS" etched on it.
- Glowing pulses travel along the traces continuously (use instanced meshes or a shader along curves).
- The camera tilts gently toward the mouse position (parallax, limited to about ±6 degrees).
- Hovering over the chip makes it light up, and pulses speed up.
- As the user scrolls, the camera pulls up and away from the board, and the scene fades into the page background.
- Overlaid HTML, not in the canvas: name, the one-line tagline, two CTAs ("View Projects", "Download Resume"), and a small blinking "● system online" status tag.
- A subtle oscilloscope waveform line runs along the bottom of the hero and reacts to mouse movement. This nods to his DSP background.

### Section transitions
- A thin glowing "trace" line runs down the left edge of the page (a fixed SVG). It fills as the user scrolls, like a progress bar.
- Each section has a small node on this line. The node lights up when the section enters the viewport.
- Section headings are styled like PCB silkscreen labels, e.g. `U1 // ABOUT`, `U2 // EXPERIENCE`, `U3 // PROJECTS`.

### Sections, in order
1. **Hero**, described above.
2. **About**: short bio on the left. On the right, a "spec sheet" card styled like a component datasheet: CGPA, branch rank, LeetCode count, patent, and location. The numbers count up when the card enters view.
3. **Experience**: a vertical timeline. Each role is a card that expands on click to show its bullets. Show the tech stack as small chips.
4. **Projects**: this is the main section.
   - Filter tabs: All / Web / IoT & Hardware / Security & Tools.
   - Show projects as a grid of cards. Each card tilts in 3D on hover (use a CSS perspective transform, not WebGL). Each card has a tech-colored glow border.
   - Clicking a card opens a modal. The modal shows the problem, what he built, the key numbers, the stack, and GitHub/live links.
   - XPLOR's modal embeds a small live React Three Fiber scene: a simple low-poly room with a couple of furniture boxes that the user can orbit. This demonstrates his actual 3D work.
   - IoT project cards show a small animated sensor-reading readout (e.g. "V: 229.4V  I: 1.2A") so they feel alive.
5. **Skills**: grouped chips (Languages / Web / Backend & DB / Embedded & IoT / Tools). Optional: an interactive force-directed graph where the skills connect to the projects that use them. Hovering a skill highlights its projects.
6. **Research & Achievements**: patent, IEEE conference paper (co-author), branch rank, and scholarship. Show them as "badge" cards.
7. **Terminal easter egg**: a small terminal widget, which also opens with the ` key. It supports these commands: `help`, `whoami`, `projects`, `skills`, `contact`, `resume`, `scan` (plays a fake port-scan animation, referencing his port scanner project), and `clear`.
8. **Contact**: email, LinkedIn, and GitHub as large buttons with a copy-email interaction, plus a simple contact form (use Formspree or a Next.js API route with Resend).

## Visual design
- Theme: dark only. Base #0A0F0D (near-black with a green tint, like a PCB). Surface #111916. Copper accent #C8783C. Signal/glow accent #3DF5C4. Muted text #8A9A93. Body text #E6EDE9.
- Fonts: "Space Grotesk" for headings, "Inter" for body, "JetBrains Mono" for labels, stats, and the terminal (all from Google Fonts).
- A subtle background grid (like PCB solder-mask dots) at very low opacity.
- Don't use purple-to-blue gradients or generic glassmorphism everywhere. Keep it sharp, technical, and a little warm because of the copper.
- Micro-interactions: magnetic hover on the CTA buttons, text scramble/decode effect on section headings when they enter view, and custom cursor (small ring that grows over interactive elements; disable on touch devices).

## Performance & accessibility (non-negotiable)
- Lazy-load every Three.js canvas (next/dynamic, ssr: false). Pause rendering when a canvas is off-screen (frameloop="demand" or an IntersectionObserver).
- Cap device pixel ratio at 1.5. Target 60fps on a mid-range laptop. Lighthouse performance should be at least 85 on desktop.
- On mobile (<768px) or with `prefers-reduced-motion`: replace the 3D hero with a static rendered image or a lightweight 2D canvas version. Also disable the custom cursor and tilt effects.
- Use semantic HTML, keyboard-navigable modals and terminal, visible focus states, and alt text. Text must hit WCAG AA contrast.
- SEO: a proper <title> and meta description, an Open Graph image, and a sitemap.
- The "Download Resume" button links to /resume.pdf in /public.

## Deliverables
- A clean folder structure (components/sections, components/three, lib, content.ts).
- A README with setup and deploy steps.
- Build it section by section. Hero first, and make sure it looks right before moving on.

Use the content below exactly. Don't invent projects, numbers, or links; leave clearly marked TODO placeholders for missing links.
```

---

## PART 2 — CONTENT

### Identity
- **Name:** Nishesh Singla
- **Tagline:** Full-stack developer who also speaks hardware — I build web platforms, 3D tools, and IoT systems.
- **Alt tagline:** From ESP32 to Next.js — engineering where signals meet software.
- **Location:** Punjab, India
- **Email:** nisheshsingla@gmail.com
- **LinkedIn:** linkedin.com/in/nishesh-singla
- **GitHub:** github.com/Nish-16
- **Status tag:** Open to SDE internships & full-time roles (2027)

### About
I'm an Electrical & Computer Engineering student at Thapar Institute of Engineering and Technology (CGPA 9.29, ranked 2nd in my branch). I spend most of my time building things end-to-end: production web apps for clients, a browser-based 3D interior design editor, and IoT systems where ESP32 boards talk to real-time dashboards. I like the whole stack — from a sensor reading on a microcontroller to the API that stores it and the UI that makes sense of it.

**Spec-sheet stats:**
- CGPA: 9.29
- Branch rank: #2 (ECE, TIET)
- LeetCode: 250+ problems
- Patent: 1 (application published)
- Production apps shipped: 3+
- Experience: 1.5+ years (internship + freelance)

### Experience

**Software Developer (Freelance) — Humble Solutions** · May 2026 – Present · Remote
Stack: Next.js, Tailwind CSS, Firebase Auth, Firestore, Cloud Functions
- Built the TechnoFluid Lubricants platform: a role-based admin dashboard, CMS, and responsive UI across 15+ screens.
- Engineered Hotel Dreamland, a full-stack hotel booking platform with 14 responsive screens, 28 reusable components, and Firestore across 8 collections.
- Deployed 7 Firebase Cloud Functions to automate user management, content moderation, and admin workflows across production apps.
- Enforced role-based access control and Firestore security rules to lock down administrative operations.

**Software Developer Intern — Glyptika Studios** · May 2025 – May 2026 · Patiala
Stack: React, Three.js, React Three Fiber, Cannon-es, Node.js, Express
- Sole developer of XPLOR, a browser-based 3D interior design editor: 9 routed pages, 7 core editor components, and 10+ object types.
- Built scene save/load, camera controls, lighting, and GLB model import/export. Cut average scene load time by 30%.
- Added physics-based collision handling with Cannon-es, so users can place uploaded 3D assets realistically.
- Designed REST APIs (Node.js/Express) for scene persistence, with file-type upload restrictions and API rate limiting.

### Projects

| # | Project | Category | Stack | Date |
|---|---|---|---|---|
| 1 | XPLOR — 3D Interior Design Editor | Web | React, Three.js, R3F, Cannon-es, Express | 2025–26 |
| 2 | TechnoFluid Lubricants Platform | Web | Next.js, Tailwind, Firebase | 2026 |
| 3 | Hotel Dreamland | Web | Next.js, Firebase Auth, Firestore | 2026 |
| 4 | API Inspector (Chrome Extension) | Security & Tools | React, TypeScript, Chrome MV3 | Jun 2026 |
| 5 | Network Port Scanner | Security & Tools | Python, sockets, ThreadPoolExecutor | Sep 2026 |
| 6 | NBA Data Management System | Web | Next.js, Express, PostgreSQL, Prisma | Oct 2025 |
| 7 | Railway Seat Verification System (patented) | IoT & Hardware | ESP32, Node.js, Express, MongoDB | Aug 2025 |
| 8 | RFID Asset Management System | IoT & Hardware | ESP32, RFID, Next.js, Firebase | May 2026 |
| 9 | Smart Energy Metering System | IoT & Hardware | ESP32, SCT013, ZMPT101B, Blynk, Firebase | Apr 2025 |
| 10 | Cycle Tracking Navigation System | IoT & Hardware | ESP32, NEO-6M GPS, Node.js | Jul 2025 |
| 11 | Personal Finance Mobile App | Web | React Native, NativeWind, Express | Feb 2026 |
| 12 | Carbon Credit Trading Platform (capstone, in progress) | IoT & Hardware | ESP32, Node.js, PostgreSQL/Prisma, Ethereum Sepolia, React, Python | 2026 |

**Featured (show larger):** XPLOR, API Inspector, Railway Seat Verification, Carbon Credit Platform.

**Card details (for modals):**

1. **XPLOR** — Design rooms in the browser. It has real-time object placement, physics-based collisions, and GLB import/export, so users can bring in their own 3D assets and export the whole scene as one file. *Key number: 30% faster scene loads.*

2. **TechnoFluid Lubricants** — A client platform with a role-based admin dashboard and CMS, so non-technical staff can manage products and content. *15+ screens, deployed in production.*

3. **Hotel Dreamland** — A hotel booking platform with authentication, bookings, and admin tooling. *14 screens, 28 reusable components, 8 Firestore collections.*

4. **API Inspector** — A Manifest V3 extension that captures REST traffic live: methods, status codes, timings, and payloads. It supports filtering, search, JSON export, one-click cURL generation, and JWT detection.

5. **Network Port Scanner** — A multithreaded TCP scanner covering all 65,535 ports, with hostname resolution, service inference, and banner grabbing. *Key number: a 100-port scan dropped from 100.7s to 1.03s (~99% faster) using 100 concurrent threads.*

6. **NBADMS** — An accreditation compliance system for tracking publications, patents, and projects. It has RBAC with 3 roles, 6+ modules, 15+ REST APIs, 10+ Prisma entities, JWT auth, and audit logging.

7. **Railway Seat Verification** — ESP32 nodes detect seat occupancy and sync it with a Node.js/MongoDB backend. Seat status updates live with sub-second latency, and the system handles 100+ passenger records. *Indian patent application published.*

8. **RFID Asset Management** — Tracks 100+ tagged assets with automated check-in/check-out. The database updates in under 1 second after a tag is detected.

9. **Smart Energy Meter** — Monitors voltage, current, power, and energy on 2-second refresh intervals. Sensor calibration brings accuracy to ±3–5%. Includes cloud logging and a historical dashboard.

10. **Cycle Tracker** — A GPS tracker with ±5m accuracy, a live map refreshing every 2 seconds, and route history.

11. **Personal Finance App** — A cross-platform expense tracker with 6 categories and budgets. Its 15+ reusable components cut UI build time by 40%.

12. **Carbon Credit Trading Platform** — Capstone project. ESP32/Modbus meters record renewable generation, which becomes carbon credits. Trades are settled and anchored on Ethereum (Sepolia), and devices authenticate with HMAC. Includes a React dashboard and ML-based price forecasting. *Status: in progress.*

### Skills
- **Languages:** C/C++, Python, JavaScript (ES6+), TypeScript, SQL
- **Frontend:** React, Next.js, React Native, Three.js / React Three Fiber, Tailwind CSS
- **Backend & DB:** Node.js, Express, PostgreSQL, Prisma, MongoDB, Firebase (Auth, Firestore, Cloud Functions)
- **Embedded & IoT:** ESP32, Arduino, RFID, NEO-6M GPS, Blynk IoT, current/voltage sensing
- **Security & Networking:** TCP/IP, socket programming, Wireshark, RBAC, JWT
- **Tools:** Git, GitHub, Linux, VS Code, Figma, VirtualBox

### Research & Achievements
- **Patent:** Indian patent application No. 202511086732 A (published) — IoT-enabled Railway Seat Verification System.
- **Conference paper (co-author):** "Bridging Human and Data: A Natural Language Approach to Structured File Querying" — selected for the IEEE AISIIC International Conference.
- **Academics:** Ranked 2nd in Electrical & Computer Engineering at TIET (certificate + cash prize); merit-based scholarship.
- **DSA:** 250+ problems solved on LeetCode.

### Leadership
**Executive Member — OWASP TIET** · Nov 2023 – Feb 2025
- Secured 3+ sponsors per event cycle through cold outreach.
- Wrote content for 8+ events.

### Terminal easter-egg output (`whoami`)
```
nishesh@portfolio:~$ whoami
Nishesh Singla — ECE @ Thapar '27
full-stack dev | 3D web | IoT tinkerer
status: open to SDE roles
```

---

## Before you publish — fix these
1. **Patent name:** your resumes say both "Seat Allocation" and "Seat Verification". I used "Verification"; pick one and use it everywhere.
2. **Patent wording:** "Published an Indian Patent" suggests it was granted. "Patent application published" is accurate and interviewers won't catch you on it.
3. **Glyptika title:** your resumes use "Software Developer Intern" and "Full-Stack Developer Intern". Use one consistently.
4. **Don't put your home address or phone number on the site.** Email + LinkedIn is enough for a public page.
5. **Links:** add GitHub/live-demo URLs for each project (the prompt leaves TODOs). Even a 20-second screen recording GIF per project massively helps.
6. **ttyDB paper:** keep it clearly marked as co-authored, since it's a team paper and not your solo project.