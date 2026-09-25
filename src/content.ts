/**
 * Single source of truth for all copy on the site.
 * Components must read from here — no hard-coded copy inside components.
 *
 * `null` links are TODO placeholders: the UI renders them as "link coming soon".
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProjectCategory = "web" | "security" | "iot" | "ai";

export interface Metric {
  value: string;
  label: string;
}

/** Decorative, simulated live readout shown in IoT project modals (clearly labelled "SIM"). */
export interface ReadoutField {
  label: string;
  /** Fixed text value (no animation). */
  text?: string;
  base?: number;
  jitter?: number;
  decimals?: number;
  unit?: string;
}

export interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  stack: string[];
  date: string;
  featured?: boolean;
  status?: string;
  /** One-liner for the card. */
  summary: string;
  /** Modal: the problem it addresses. */
  problem: string;
  /** Modal: what was built. */
  built: string[];
  /** Key numbers (card shows the first one). */
  metrics: Metric[];
  links: { github: string | null; live: string | null };
  readout?: ReadoutField[];
  /** Embedded interactive demo in the modal. */
  demo?: "xplor-room";
  /** Modal: where/for whom it was built, e.g. "Freelance client work via Humble Solutions." */
  context?: string;
}

export interface Role {
  title: string;
  org: string;
  kind: "work" | "leadership";
  period: string;
  location: string;
  /** One-line summary shown under the title. */
  summary?: string;
  stack: string[];
  bullets: string[];
}

export interface Education {
  school: string;
  degree: string;
  dates: string;
  location: string;
  coursework: string[];
}

export interface Skill {
  name: string;
  /** Stack tokens (from Project.stack) that count as using this skill. */
  match?: string[];
  /** Extra project slugs that use this skill but don't list it in their stack. */
  projects?: string[];
}

export interface SkillGroup {
  label: string;
  skills: Skill[];
}

export interface Achievement {
  kind: string;
  title: string;
  detail: string;
}

export interface Stat {
  key: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  note?: string;
}

// ---------------------------------------------------------------------------
// Identity & site
// ---------------------------------------------------------------------------

/** NEXT_PUBLIC_SITE_URL → Vercel's production domain → fallback. Empty values are ignored; https:// is added if missing. */
function resolveSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    "nishesh-singla.vercel.app";
  const url = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
  return url.replace(/\/+$/, "");
}

export const site = {
  // Used for sitemap, canonical URL and Open Graph. Set NEXT_PUBLIC_SITE_URL once you have a custom domain.
  url: resolveSiteUrl(),
  name: "Nishesh Singla",
  title: "Nishesh Singla — Full-stack Developer",
  description:
    "Nishesh Singla is a full-stack developer (Next.js, Node.js, React Three Fiber) and EEC student at Thapar Institute ('27) who ships production web apps, browser-based 3D tools, and developer tooling.",
  resumePath: "/resume.pdf", // TODO: drop resume.pdf into /public
};

export const identity = {
  name: "Nishesh Singla",
  firstName: "Nishesh",
  tagline:
    "Full-stack developer building production web apps, browser-based 3D tools, and developer tooling — from the data model to the pixels.",
  altTagline: "Full-stack developer — Next.js, Node.js, and 3D on the web.",
  location: "Punjab, India",
  email: "nisheshsingla@gmail.com",
  linkedin: "https://www.linkedin.com/in/nishesh-singla",
  linkedinLabel: "linkedin.com/in/nishesh-singla",
  github: "https://github.com/Nish-16",
  githubLabel: "github.com/Nish-16",
  status: "Open to SDE internships & full-time roles (2027)",
};

export const hero = {
  eyebrow: "Full-stack developer · Thapar Institute '27",
  scrollHint: "scroll",
  /** Labels for the architecture graph in the hero. */
  graph: {
    client: { label: "browser", sub: "react · three.js" },
    next: { label: "next.js", sub: "ssr · routing" },
    auth: { label: "auth", sub: "jwt · rbac" },
    api: { label: "api", sub: "node · express" },
    fn: { label: "functions", sub: "cloud functions" },
    pg: { label: "postgres", sub: "prisma" },
    mongo: { label: "mongodb", sub: "documents" },
    fs: { label: "firestore", sub: "realtime" },
  },
};

// ---------------------------------------------------------------------------
// Sections (order = page order; headings read `~/label`)
// ---------------------------------------------------------------------------

export const sections = [
  { id: "about", label: "About", nav: true },
  { id: "experience", label: "Experience", nav: true },
  { id: "projects", label: "Projects", nav: true },
  { id: "skills", label: "Skills", nav: true },
  { id: "research", label: "Research", nav: false },
  { id: "leadership", label: "Leadership", nav: false },
  { id: "terminal", label: "Terminal", nav: false },
  { id: "contact", label: "Contact", nav: true },
] as const;

export type SectionId = (typeof sections)[number]["id"];

export const sectionIntros: Record<SectionId, string> = {
  about: "I build the whole thing — API, data model, and UI.",
  experience: "Roles that shipped to production.",
  projects: "Full-stack platforms, AI agents, developer tools, and a few IoT builds.",
  skills: "Hover a skill to trace which projects it powers.",
  research: "Patents, papers, rankings, and awards.",
  leadership: "Outside the code.",
  terminal: "Prefer a shell? Press ` anywhere to open it.",
  contact: "Let's build something that ships.",
};

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------

export const about = {
  bio: [
    "I'm a full-stack developer and an Electrical & Computer Engineering student at Thapar Institute of Engineering and Technology (CGPA 9.29, ranked 2nd in my branch).",
    "I like owning things end-to-end: I've shipped production web platforms for clients, been the sole developer of a browser-based 3D interior design editor, and more recently built an LLM + RAG support agent, security tooling, and a blockchain-anchored carbon credit platform.",
    "My EEC background means I'm comfortable lower in the stack too — I've connected ESP32 devices to real-time backends — but what I enjoy most is designing the API, the data model, and the UI that makes sense of it.",
  ],
  profileFile: "profile.json",
  profileRole: "Full-stack developer",
  stats: [
    { key: "projects_built", value: 14 },
    { key: "client_apps", value: 2, note: "in production" },
    { key: "experience_years", value: 1.5, decimals: 1, suffix: "+", note: "internship + freelance" },
    { key: "leetcode", value: 250, suffix: "+", note: "problems solved" },
    { key: "cgpa", value: 9.29, decimals: 2 },
    { key: "branch_rank", value: 2, prefix: "#", note: "EEC, TIET" },
    { key: "patents", value: 1, note: "application published" },
  ] satisfies Stat[],
  education: {
    school: "Thapar Institute of Engineering and Technology",
    degree: "B.E. Electrical and Computer Engineering",
    dates: "Sep 2023 – Jun 2027",
    location: "Patiala, Punjab",
    coursework: [
      "Data Structures & Algorithms",
      "Operating Systems",
      "Computer Networks",
      "Computer Architecture",
      "Object-Oriented Programming",
      "Database Management Systems",
      "Machine Learning Techniques",
      "Mathematics for Data Science",
      "Discrete Mathematical Structures",
      "Embedded Systems & IoT",
      "Cyber & Network Security",
      "Blockchain & its Applications",
    ],
  } satisfies Education,
  educationLabels: { title: "Education", coursework: "Relevant coursework" },
};

// ---------------------------------------------------------------------------
// Experience
// ---------------------------------------------------------------------------

export const experience: Role[] = [
  {
    title: "Software Developer (Freelance)",
    org: "Humble Solutions",
    kind: "work",
    period: "May 2026 – Present",
    location: "Remote",
    summary: "Turning client business workflows into production web platforms.",
    stack: ["Next.js", "Tailwind CSS", "Firebase Auth", "Firestore", "Cloud Functions"],
    bullets: [
      "Translated client requirements into two production platforms, TechnoFluid Lubricants and Hotel Dreamland, converting business workflows into scalable web solutions.",
      "Built TechnoFluid's role-based admin dashboard, CMS, and responsive UI across 15+ screens.",
      "Engineered Hotel Dreamland: 14 responsive screens, 28 reusable components, Firebase Authentication, and Firestore across 8 collections.",
      "Deployed 7 Firebase Cloud Functions to enforce server-side business logic and automate user management, content moderation, and admin workflows.",
      "Secured admin operations with authentication, role-based access control, and Firestore security rules.",
    ],
  },
  {
    title: "Full-Stack Developer Intern",
    org: "Glyptika Studios",
    kind: "work",
    period: "May 2025 – May 2026",
    location: "Patiala, Punjab",
    summary: "Sole developer of XPLOR, a browser-based 3D interior design editor.",
    stack: ["React", "Three.js", "React Three Fiber", "Cannon-es", "Node.js", "Express", "Google OAuth"],
    bullets: [
      "Contributed to market research for XPLOR, turning user needs into product requirements and technology-stack decisions.",
      "Owned end-to-end development of the 3D scene editor: 9 routed pages, 7 core editor components, 10+ object types, real-time placement, camera controls, and lighting.",
      "Engineered scene serialization, GLB model import/export, and persistence workflows, reducing average scene load time by 30%.",
      "Added physics-based collision handling with Cannon-es so users can upload custom 3D assets and export composed scenes as a single file.",
      "Integrated Google OAuth and a scene-persistence REST API (Node.js/Express), with file-type upload restrictions and API rate limiting.",
    ],
  },
  {
    title: "Summer Intern",
    org: "Thapar Institute of Engineering and Technology",
    kind: "work",
    period: "Summer internship", // TODO: exact months + year, e.g. "Jun 2025 – Jul 2025"
    location: "Patiala",
    summary: "Team project turning a demo car into an autonomous vehicle using LiDAR and ROS.",
    stack: ["ROS", "LiDAR", "IoT"], // TODO: add the web panel's stack
    bullets: [
      "Worked in a team converting a demo car into an autonomous vehicle using LiDAR and ROS (Robot Operating System).",
      "Built the web panel on the software side of the project.", // TODO: what the panel showed/controlled
      "Helped debug the IoT side and supported the team during integration and testing.",
    ],
  },
  {
    title: "Executive Member",
    org: "OWASP TIET",
    kind: "leadership",
    period: "Nov 2023 – Feb 2025",
    location: "Patiala",
    stack: ["Sponsorship", "Events"],
    bullets: [
      "Ran sponsorship outreach through cold calling and email campaigns: 30+ prospective sponsors contacted, 3+ secured per event cycle.",
      "Coordinated planning, marketing, and communications across 8+ events.",
    ],
  },
  {
    title: "Executive Member",
    org: "Microsoft Learn Student Chapter, TIET",
    kind: "leadership",
    period: "Nov 2023 – Dec 2024",
    location: "Patiala",
    stack: ["Events", "Outreach"],
    bullets: [
      "Contributed to event planning, marketing, content, and outreach to drive student engagement.",
      "Helped deliver 5+ technical and community events.",
    ],
  },
];

export const experienceLabels = {
  expand: "Show details",
  collapse: "Hide details",
  leadership: "Leadership",
};

// ---------------------------------------------------------------------------
// Projects (order = display order: software first)
// ---------------------------------------------------------------------------

export const projectCategories: {
  id: ProjectCategory;
  label: string;
  color: string;
}[] = [
  { id: "web", label: "Full-stack & Web", color: "var(--cat-web)" },
  { id: "security", label: "Networking & Tools", color: "var(--cat-security)" },
  { id: "ai", label: "AI & ML", color: "var(--cat-ai)" },
  { id: "iot", label: "Hardware & IoT", color: "var(--cat-iot)" },
];

export const projectLabels = {
  all: "All",
  problem: "Problem",
  built: "What I built",
  numbers: "Key numbers",
  stack: "Stack",
  github: "GitHub",
  live: "Live demo",
  linkTodo: "link coming soon",
  open: "Open details",
  close: "Close",
  simulated: "SIM",
  demoCaption: "Drag to orbit a low-poly XPLOR-style room. Scroll to zoom.",
  featured: "Featured",
};

export const projects: Project[] = [
  {
    slug: "xplor",
    title: "XPLOR — 3D Interior Design Editor",
    category: "web",
    stack: ["React", "Three.js", "R3F", "Cannon-es", "Node.js", "Express", "Google OAuth"],
    date: "2025–26",
    featured: true,
    context: "Built at Glyptika Studios as the sole developer.",
    summary: "Design rooms in the browser: place, transform, and physically arrange 3D furniture, then export the scene.",
    problem: "Planning an interior usually means expensive desktop software or guesswork. XPLOR brings a lightweight 3D room editor to the browser.",
    built: [
      "9 routed pages and 7 core editor components with real-time object placement, transforms, camera controls, and lighting.",
      "Support for 10+ object types, plus GLB import so users can bring their own 3D assets.",
      "Physics-based collision handling with Cannon-es so objects don't clip through each other.",
      "Scene serialization and save/load through a REST persistence API with Google OAuth.",
      "Export of a composed scene as a single GLB file.",
      "Upload file-type restrictions and API rate limiting against abusive requests.",
    ],
    metrics: [
      { value: "30%", label: "faster scene loads" },
      { value: "10+", label: "object types" },
      { value: "7", label: "editor components" },
    ],
    links: { github: null, live: null }, // TODO: add repo + live URLs
    demo: "xplor-room",
  },
  {
    slug: "ai-support-agent",
    title: "AI Customer Support Agent",
    category: "ai",
    stack: ["Python", "LLMs", "Groq", "RAG", "ChromaDB", "Embeddings"],
    date: "2026",
    featured: true,
    summary: "An LLM + RAG support agent that classifies intent, retrieves similar past tickets, and knows when to escalate.",
    problem: "Support teams answer the same questions repeatedly. The hard part is answering well and knowing when not to answer.",
    built: [
      "Built on 5,938 real DropboxSupport tweet–reply pairs.",
      "Classifies queries across 13 intents, retrieves similar historical conversations from ChromaDB, and applies rule-based escalation.",
      "Embedding-based retrieval, schema validation, retry handling, and caching.",
      "LLM-as-judge response evaluation, validated against human ratings.",
    ],
    metrics: [
      { value: "81.0%", label: "intent accuracy (hand-labelled, n=174)" },
      { value: "77.1%", label: "held-out split accuracy" },
      { value: "40.8%", label: "TF-IDF + LogReg baseline" },
      { value: "+72%", label: "retrieval precision gain" },
      { value: "0.73", label: "judge ↔ human Spearman" },
    ],
    links: { github: null, live: null }, // TODO
  },
  {
    slug: "youtube-ai-summarizer",
    title: "YouTube AI Summarizer",
    category: "ai",
    stack: ["TypeScript", "React", "Chrome MV3", "Vite", "Zod", "LLMs", "Groq"],
    date: "Sep 2026",
    status: "In progress",
    summary: "A Chrome extension that turns the YouTube video you're watching into structured study notes with an LLM.",
    problem: "Turning a long lecture into study notes by hand is slow, and fetching captions from a server gets blocked by YouTube — so this runs in the browser, on your own session.",
    built: [
      "Manifest V3 extension with a React side panel: topics, key points, definitions, code/formulas, and timestamps for the current video.",
      "Transcript extraction inside the page: reads the player response, prefers manual captions over auto-generated ones, and captures the player's caption token with a PerformanceObserver.",
      "8 distinct failure states (no captions, unplayable, ad still playing, page structure changed…) so the user knows what actually went wrong.",
      "Long videos are split into ~9-minute windows with 45-second overlap; pass 1 extracts topics per chunk, pass 2 merges duplicates and writes the summary.",
      "Model output streams as JSON Lines, validated with Zod, and renders topic by topic.",
      "Bring-your-own API key for Claude, OpenAI, Gemini, or Groq, with each provider's host permission requested only when chosen, plus 429 Retry-After handling.",
      "Job progress persisted to chrome.storage.local so long generations survive MV3 service-worker restarts.",
    ],
    metrics: [
      { value: "4", label: "LLM providers" },
      { value: "2-pass", label: "chunked generation" },
      { value: "8", label: "failure states" },
    ],
    links: { github: null, live: null }, // TODO
  },
  {
    slug: "carbonguard",
    title: "CarbonGuard — Carbon Credit Platform",
    category: "web",
    stack: ["Node.js", "Express", "PostgreSQL", "Prisma", "Solidity", "Ethereum Sepolia", "React", "Python", "ESP32", "Modbus"],
    date: "2026",
    featured: true,
    status: "Capstone · in progress",
    summary: "Turns verified renewable generation from ESP32 meters into tradeable carbon credits, settled on-chain.",
    problem: "Small-scale renewable generators are shut out of carbon markets: verification is costly, and credit records are hard to trust.",
    built: [
      "ESP32 metering nodes stream generation telemetry to an Express backend.",
      "A generation-based credit methodology benchmarked to CEA's 0.710 kgCO₂/kWh grid emission factor.",
      "Dual authentication: JWT + RBAC for users, and HMAC-SHA256 with replay protection for devices.",
      "A four-stage trade lifecycle with tamper-evident on-chain anchoring. On-chain settlement is the system of record, with PostgreSQL as the indexed read layer for dashboards.",
      "ML price forecasting to guide generator pricing.",
      "Co-authored a manuscript on the platform, submitted to an IEEE conference.",
    ],
    metrics: [
      { value: "0.710", label: "kgCO₂/kWh emission factor" },
      { value: "4", label: "trade lifecycle stages" },
      { value: "2", label: "auth layers (JWT + HMAC)" },
    ],
    links: { github: null, live: null }, // TODO
  },
  {
    slug: "api-inspector",
    title: "API Inspector",
    category: "security",
    stack: ["React", "TypeScript", "Chrome MV3"],
    date: "Jun 2026",
    featured: true,
    summary: "A Manifest V3 extension that inspects REST traffic live, with filtering, cURL export, and JWT detection.",
    problem: "Debugging APIs in DevTools means a lot of clicking, copying, and repeating.",
    built: [
      "Captures HTTP methods, status codes, response times, and payload metadata in real time.",
      "Endpoint filtering, request search, and JSON export.",
      "One-click cURL generation for replaying requests.",
      "Automatic JWT detection in requests.",
    ],
    metrics: [
      { value: "MV3", label: "Chrome extension" },
      { value: "cURL", label: "one-click generation" },
    ],
    links: { github: null, live: null }, // TODO
  },
  {
    slug: "nbadms",
    title: "NBA Data Management System",
    category: "web",
    stack: ["Next.js", "Express", "PostgreSQL", "Prisma", "JWT"],
    date: "Oct 2025",
    summary: "A full-stack accreditation compliance system for publications, patents, and projects, with RBAC.",
    problem: "Accreditation (NBA) data is scattered across departments and spreadsheets, and it's painful to compile.",
    built: [
      "Role-based access control with 3 user roles across 6+ modules (publications, patents, projects).",
      "15+ REST APIs with a modular architecture for auth, reporting, and workflows.",
      "10+ PostgreSQL entities modeled with Prisma, plus JWT auth, session tracking, and audit logging.",
    ],
    metrics: [
      { value: "15+", label: "REST APIs" },
      { value: "10+", label: "DB entities" },
      { value: "3", label: "user roles" },
    ],
    links: { github: null, live: null }, // TODO
  },
  {
    slug: "technofluid",
    title: "TechnoFluid Lubricants Platform",
    category: "web",
    stack: ["Next.js", "Tailwind", "Firebase Auth", "Firestore", "Cloud Functions"],
    date: "2026",
    context: "Freelance client work via Humble Solutions.",
    summary: "A production client platform with a role-based admin dashboard and CMS.",
    problem: "The client needed non-technical staff to manage products and content without touching code.",
    built: [
      "A role-based admin dashboard and content management system.",
      "Responsive UI across 15+ screens.",
      "Firestore security rules and server-side access controls.",
    ],
    metrics: [
      { value: "15+", label: "screens" },
      { value: "Prod", label: "deployed in production" },
    ],
    links: { github: null, live: null }, // TODO
  },
  {
    slug: "hotel-dreamland",
    title: "Hotel Dreamland",
    category: "web",
    stack: ["Next.js", "Firebase Auth", "Firestore", "Cloud Functions"],
    date: "2026",
    context: "Freelance client work via Humble Solutions.",
    summary: "A full-stack hotel booking platform built for a client.",
    problem: "The hotel needed direct online bookings and an admin panel to run them.",
    built: [
      "14 responsive screens built from 28 reusable components.",
      "Firebase Authentication and Firestore across 8 collections.",
      "Admin workflows automated with Cloud Functions.",
    ],
    metrics: [
      { value: "14", label: "screens" },
      { value: "28", label: "reusable components" },
      { value: "8", label: "Firestore collections" },
    ],
    links: { github: null, live: null }, // TODO
  },
  {
    slug: "port-scanner",
    title: "Network Port Scanner",
    category: "security",
    stack: ["Python", "TCP/IP", "sockets", "ThreadPoolExecutor"],
    date: "Sep 2026",
    summary: "A multithreaded TCP scanner covering all 65,535 ports, with service inference and banner grabbing.",
    problem: "Sequential port scans are painfully slow; concurrency is the whole game.",
    built: [
      "Configurable scans across all 65,535 ports using Python sockets and ThreadPoolExecutor.",
      "Hostname resolution, configurable timeouts, service inference, and banner grabbing.",
      "Clean thread cleanup and resource handling.",
    ],
    metrics: [
      { value: "~99%", label: "faster (100.7s → 1.03s per 100 ports)" },
      { value: "65,535", label: "ports covered" },
      { value: "100", label: "concurrent threads" },
    ],
    links: { github: null, live: null }, // TODO
  },
  {
    slug: "finance-app",
    title: "Personal Finance Mobile App",
    category: "web",
    stack: ["React Native", "NativeWind", "Express"],
    date: "Feb 2026",
    summary: "A cross-platform expense tracker with categories, budgets, and transaction history.",
    problem: "Tracking daily spending should take seconds, on any phone.",
    built: [
      "6 spending categories with persistent transaction history and budget management.",
      "15+ reusable components for a consistent UX across iOS and Android, cutting UI build time by 40%.",
    ],
    metrics: [
      { value: "40%", label: "faster UI builds" },
      { value: "15+", label: "reusable components" },
      { value: "6", label: "categories" },
    ],
    links: { github: null, live: null }, // TODO
  },
  {
    slug: "railway-seat",
    title: "Railway Seat Verification System",
    category: "iot",
    stack: ["Node.js", "Express", "MongoDB", "REST APIs", "ESP32"],
    date: "Aug 2025",
    status: "Patent application published",
    summary: "PNR-based passenger self-verification with live seat indicators, so ticket checkers handle only the exceptions.",
    problem: "Ticket checkers manually match every passenger to their seat across 100+ berths per coach. It's slow, repetitive, and error-prone.",
    built: [
      "PNR-based self-verification: each seat indicator flips from unverified to verified once the booking is validated.",
      "ESP32 seat nodes synced in real time with a Node.js + MongoDB backend through REST APIs.",
      "Handles 100+ passenger records with sub-second hardware-to-backend latency in local testing.",
      "Shifts staff effort from checking every seat to handling only the exceptions, visible at a glance.",
    ],
    metrics: [
      { value: "<1s", label: "seat-status latency" },
      { value: "100+", label: "berths per coach" },
      { value: "Patent", label: "Indian application 202511086732 A" },
    ],
    links: { github: null, live: null }, // TODO: add patent publication link
    readout: [
      { label: "SEAT", text: "S4-42" },
      { label: "PNR", text: "VERIFIED" },
      { label: "SYNC", base: 0.42, jitter: 0.12, decimals: 2, unit: "s" },
    ],
  },
  {
    slug: "rfid-assets",
    title: "RFID Asset Management System",
    category: "iot",
    stack: ["Next.js", "Firebase", "ESP32", "RFID"],
    date: "May 2026",
    summary: "Tap-to-track inventory: automated check-in and check-out for 100+ tagged assets.",
    problem: "Manual asset registers drift out of date quickly.",
    built: [
      "Uniquely identifies and manages 100+ assets with RFID tags.",
      "ESP32 + RFID reader integrated with a Next.js + Firebase dashboard for automated check-in/check-out and inventory monitoring.",
      "The database updates in under 1 second after a tag is detected.",
    ],
    metrics: [
      { value: "<1s", label: "tag → database" },
      { value: "100+", label: "assets tracked" },
    ],
    links: { github: null, live: null }, // TODO
    readout: [
      { label: "TAG", text: "3F:2A:91:0C" },
      { label: "DB", base: 0.6, jitter: 0.2, decimals: 2, unit: "s" },
    ],
  },
  {
    slug: "energy-meter",
    title: "Smart Energy Metering System",
    category: "iot",
    stack: ["Firebase", "Blynk", "ESP32", "SCT013", "ZMPT101B"],
    date: "Apr 2025",
    summary: "Real-time voltage, current, power, and energy monitoring with calibrated sensors and cloud logging.",
    problem: "Households can't see their electricity use as it happens, only on the monthly bill.",
    built: [
      "Voltage and current sensing with SCT013 and ZMPT101B on an ESP32.",
      "Sensor calibration to reach ±3–5% accuracy.",
      "Cloud data logging and a real-time dashboard with historical analysis.",
    ],
    metrics: [
      { value: "2s", label: "refresh interval" },
      { value: "±3–5%", label: "calibrated accuracy" },
    ],
    links: { github: null, live: null }, // TODO
    readout: [
      { label: "V", base: 229.4, jitter: 1.6, decimals: 1, unit: "V" },
      { label: "I", base: 1.2, jitter: 0.08, decimals: 2, unit: "A" },
      { label: "P", base: 275, jitter: 18, decimals: 0, unit: "W" },
    ],
  },
  {
    slug: "cycle-tracker",
    title: "Cycle Tracking Navigation System",
    category: "iot",
    stack: ["Node.js", "ESP32", "NEO-6M GPS"],
    date: "Jul 2025",
    summary: "A GPS cycle tracker with a live map dashboard and route history.",
    problem: "Cheap, self-built live tracking for bicycles.",
    built: [
      "ESP32 + NEO-6M GPS module with ±5m accuracy.",
      "A Node.js backend that stores and streams continuous location updates.",
      "A live dashboard with route history visualization.",
    ],
    metrics: [
      { value: "±5m", label: "GPS accuracy" },
      { value: "2s", label: "refresh interval" },
    ],
    links: { github: null, live: null }, // TODO
    readout: [
      { label: "LAT", base: 30.3564, jitter: 0.0004, decimals: 4, unit: "°N" },
      { label: "LON", base: 76.3647, jitter: 0.0004, decimals: 4, unit: "°E" },
      { label: "V", base: 17.8, jitter: 2.4, decimals: 1, unit: "km/h" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

export const skillGroups: SkillGroup[] = [
  {
    label: "Languages",
    skills: [
      { name: "TypeScript", match: ["TypeScript"] },
      { name: "JavaScript (ES6+)" },
      { name: "Python", match: ["Python"] },
      { name: "SQL", match: ["PostgreSQL"] },
      { name: "C/C++" },
    ],
  },
  {
    label: "Frontend & 3D",
    skills: [
      { name: "React", match: ["React"] },
      { name: "Next.js", match: ["Next.js"] },
      { name: "React Native", match: ["React Native"] },
      { name: "Three.js / R3F", match: ["Three.js", "R3F"] },
      { name: "Tailwind CSS", match: ["Tailwind", "NativeWind"] },
      { name: "Chrome Extensions (MV3)", match: ["Chrome MV3"] },
    ],
  },
  {
    label: "Backend & Databases",
    skills: [
      { name: "Node.js", match: ["Node.js"] },
      { name: "Express", match: ["Express"] },
      { name: "REST APIs", match: ["REST APIs"], projects: ["xplor", "nbadms"] },
      { name: "PostgreSQL", match: ["PostgreSQL"] },
      { name: "Prisma", match: ["Prisma"] },
      { name: "MongoDB", match: ["MongoDB"] },
      { name: "Firebase / Firestore", match: ["Firebase", "Firebase Auth", "Firestore"] },
      { name: "Cloud Functions", match: ["Cloud Functions"] },
    ],
  },
  {
    label: "AI & Data",
    skills: [
      { name: "LLMs", match: ["LLMs"] },
      { name: "RAG", match: ["RAG"] },
      { name: "ChromaDB", match: ["ChromaDB"] },
      { name: "Groq", match: ["Groq"] },
      { name: "Power BI" },
      { name: "Tableau" },
      { name: "Excel" },
    ],
  },
  {
    label: "Security & Networking",
    skills: [
      { name: "RBAC", projects: ["nbadms", "technofluid", "carbonguard"] },
      { name: "JWT", match: ["JWT"], projects: ["api-inspector", "carbonguard"] },
      { name: "HMAC auth", projects: ["carbonguard"] },
      { name: "TCP/IP", match: ["TCP/IP"] },
      { name: "Socket programming", match: ["sockets"] },
      { name: "Wireshark" },
    ],
  },
  {
    label: "Blockchain",
    skills: [
      { name: "Solidity", match: ["Solidity"] },
      { name: "Ethereum (Sepolia)", match: ["Ethereum Sepolia"] },
    ],
  },
  {
    label: "Tools",
    skills: [{ name: "Git" }, { name: "GitHub" }, { name: "Linux" }, { name: "VS Code" }, { name: "Figma" }, { name: "VirtualBox" }],
  },
  {
    label: "Embedded & IoT",
    skills: [
      { name: "ESP32", match: ["ESP32"] },
      { name: "Arduino" },
      { name: "RFID", match: ["RFID"] },
      { name: "NEO-6M GPS", match: ["NEO-6M GPS"] },
      { name: "Blynk IoT", match: ["Blynk"] },
      { name: "Modbus", match: ["Modbus"] },
      { name: "Current/voltage sensing", match: ["SCT013", "ZMPT101B"] },
    ],
  },
];

export const skillLabels = {
  graphTitle: "Skill ↔ project graph",
  graphHint: "Hover or focus a node to trace its connections.",
  legendSkill: "Skill",
};

// ---------------------------------------------------------------------------
// Research & achievements
// ---------------------------------------------------------------------------

export const achievements: Achievement[] = [
  {
    kind: "Patent",
    title: "Indian Patent Application Published",
    detail: "No. 202511086732 A — IoT-enabled Railway Seat Verification System.",
  },
  {
    kind: "Research",
    title: "CarbonGuard Manuscript",
    detail: "Co-authored a manuscript on the carbon credit platform, submitted to an IEEE conference.",
  },
  {
    kind: "Academics",
    title: "Rank #2 — EEC Branch, TIET",
    detail: "Awarded a certificate and cash prize for academic performance.",
  },
  {
    kind: "Scholarship",
    title: "Merit-Based Scholarship",
    detail: "Awarded by Thapar Institute for academic performance.",
  },
  {
    kind: "DSA",
    title: "250+ LeetCode Problems",
    detail: "Consistent data structures and algorithms practice.",
  },
];

// ---------------------------------------------------------------------------
// Terminal
// ---------------------------------------------------------------------------

export const terminal = {
  prompt: "nishesh@portfolio:~$",
  title: "tty0 — nishesh@portfolio",
  welcome: ["portfolio shell v2 — type `help` to list commands."],
  openHint: "Press ` to toggle the terminal",
  closeHint: "esc / ` to close",
  whoami: [
    "Nishesh Singla — EEC @ Thapar '27",
    "full-stack dev | 3D web | dev tooling",
    "status: open to SDE roles",
  ],
  help: [
    ["help", "list commands"],
    ["whoami", "who is this?"],
    ["cd <section>", "jump to about | experience | projects | skills | contact"],
    ["projects", "list projects"],
    ["skills", "list skills"],
    ["contact", "how to reach me"],
    ["resume", "open resume.pdf"],
    ["scan", "run the port scanner (simulated)"],
    ["theme", "toggle light / dark"],
    ["clear", "clear the screen"],
  ] as [string, string][],
  notFound: (cmd: string) => `command not found: ${cmd}. Try \`help\`.`,
  cdUsage: "usage: cd about | experience | projects | skills | research | contact",
  cdGoing: (section: string) => `→ ~/${section}`,
  projectsHint: "→ cd projects for details",
  resumeMessage: "opening /resume.pdf …",
  themeMessage: (t: string) => `theme → ${t}`,
  scan: {
    target: "portfolio.local (127.0.0.1)",
    openPorts: [
      { port: 22, service: "ssh", banner: "OpenSSH_9.6" },
      { port: 80, service: "http", banner: "nginx" },
      { port: 443, service: "https", banner: "nginx" },
      { port: 3000, service: "next-dev", banner: "Next.js" },
      { port: 5432, service: "postgresql", banner: "PostgreSQL 16" },
    ],
    footer: "scan complete (simulated).",
    benchmark: "real benchmark: 100 ports in 1.03s with 100 threads (was 100.7s) — see Network Port Scanner.",
  },
};

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

export const contact = {
  labels: { email: "Email", linkedin: "LinkedIn", github: "GitHub" },
  copyEmail: "Copy email",
  copied: "Copied!",
  form: {
    name: "Name",
    email: "Email",
    message: "Message",
    submit: "Send message",
    sending: "Sending…",
    success: "Message received. I'll get back to you soon.",
    error: "Couldn't send that. Please email me directly instead.",
    notConfigured: "The contact form isn't wired up yet — please email me directly.",
  },
};

export const footer = {
  text: "Designed & built by Nishesh Singla · Next.js, React Three Fiber, Tailwind.",
};

export const nav = {
  terminal: "Terminal",
  skip: "Skip to content",
  primary: "Primary",
  toLight: "Switch to light theme",
  toDark: "Switch to dark theme",
};
