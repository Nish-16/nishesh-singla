/**
 * Single source of truth for all copy on the site.
 * Components must read from here — no hard-coded copy inside components.
 *
 * `null` links are TODO placeholders: the UI renders them as "link coming soon".
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProjectCategory = "web" | "security" | "iot";

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
}

export interface Role {
  title: string;
  org: string;
  kind: "work" | "leadership";
  period: string;
  location: string;
  stack: string[];
  bullets: string[];
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
  { id: "terminal", label: "Terminal", nav: false },
  { id: "contact", label: "Contact", nav: true },
] as const;

export type SectionId = (typeof sections)[number]["id"];

export const sectionIntros: Record<SectionId, string> = {
  about: "I build the whole thing — API, data model, and UI.",
  experience: "Roles that shipped to production.",
  projects: "Full-stack platforms, developer tools, and a few IoT builds.",
  skills: "Hover a skill to trace which projects it powers.",
  research: "Patents, rankings, and awards.",
  terminal: "Prefer a shell? Press ` anywhere to open it.",
  contact: "Let's build something that ships.",
};

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------

export const about = {
  bio: [
    "I'm a full-stack developer and an Electrical & Computer Engineering student at Thapar Institute of Engineering and Technology (CGPA 9.29, ranked 2nd in my branch).",
    "I build products end-to-end: production web apps for clients on Next.js and Firebase, a browser-based 3D interior design editor in React Three Fiber, and developer tools like a Chrome extension that inspects API traffic.",
    "My EEC background means I'm comfortable lower in the stack too — I've connected ESP32 devices to real-time backends — but what I enjoy most is designing the API, the data model, and the UI that makes sense of it.",
  ],
  profileFile: "profile.json",
  profileRole: "Full-stack developer",
  stats: [
    { key: "production_apps", value: 3, suffix: "+", note: "shipped" },
    { key: "experience_years", value: 1.5, decimals: 1, suffix: "+", note: "internship + freelance" },
    { key: "leetcode", value: 250, suffix: "+", note: "problems solved" },
    { key: "cgpa", value: 9.29, decimals: 2 },
    { key: "branch_rank", value: 2, prefix: "#", note: "EEC, TIET" },
    { key: "patents", value: 1, note: "application published" },
  ] satisfies Stat[],
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
    stack: ["Next.js", "Tailwind CSS", "Firebase Auth", "Firestore", "Cloud Functions"],
    bullets: [
      "Built the TechnoFluid Lubricants platform: a role-based admin dashboard, CMS, and responsive UI across 15+ screens.",
      "Engineered Hotel Dreamland, a full-stack hotel booking platform with 14 responsive screens, 28 reusable components, and Firestore across 8 collections.",
      "Deployed 7 Firebase Cloud Functions to automate user management, content moderation, and admin workflows across production apps.",
      "Enforced role-based access control and Firestore security rules to lock down administrative operations.",
    ],
  },
  {
    title: "Full-Stack Developer Intern",
    org: "Glyptika Studios",
    kind: "work",
    period: "May 2025 – May 2026",
    location: "Patiala",
    stack: ["React", "Three.js", "React Three Fiber", "Cannon-es", "Node.js", "Express"],
    bullets: [
      "Sole developer of XPLOR, a browser-based 3D interior design editor: 9 routed pages, 7 core editor components, and 10+ object types.",
      "Built scene save/load, camera controls, lighting, and GLB model import/export. Cut average scene load time by 30%.",
      "Added physics-based collision handling with Cannon-es, so users can place uploaded 3D assets realistically.",
      "Designed REST APIs (Node.js/Express) for scene persistence, with file-type upload restrictions and API rate limiting.",
    ],
  },
  {
    title: "Executive Member",
    org: "OWASP TIET",
    kind: "leadership",
    period: "Nov 2023 – Feb 2025",
    location: "Patiala",
    stack: ["Sponsorship", "Content"],
    bullets: [
      "Secured 3+ sponsors per event cycle through cold outreach.",
      "Wrote content for 8+ events.",
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
  { id: "security", label: "Security & Tools", color: "var(--cat-security)" },
  { id: "iot", label: "IoT & Embedded", color: "var(--cat-iot)" },
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
    stack: ["React", "Three.js", "R3F", "Cannon-es", "Node.js", "Express"],
    date: "2025–26",
    featured: true,
    summary: "Design rooms in the browser — real-time placement, physics collisions, GLB import/export.",
    problem: "Design rooms in the browser, with your own 3D assets, and export the whole scene as one file.",
    built: [
      "Real-time object placement with physics-based collisions (Cannon-es), so uploaded 3D assets sit realistically.",
      "GLB import/export — users bring in their own models and export the whole scene as one file.",
      "Scene save/load, camera controls, and lighting; 9 routed pages, 7 core editor components, 10+ object types.",
      "REST APIs (Node.js/Express) for scene persistence, with file-type upload restrictions and rate limiting.",
    ],
    metrics: [
      { value: "30%", label: "faster scene loads" },
      { value: "9", label: "routed pages" },
      { value: "10+", label: "object types" },
    ],
    links: { github: null, live: null }, // TODO: add repo + live URLs
    demo: "xplor-room",
  },
  {
    slug: "api-inspector",
    title: "API Inspector",
    category: "security",
    stack: ["React", "TypeScript", "Chrome MV3"],
    date: "Jun 2026",
    featured: true,
    summary: "Chrome extension that captures a page's REST traffic live — filter, search, export, cURL.",
    problem: "See the REST traffic a page makes — methods, status codes, timings, payloads — as it happens.",
    built: [
      "Manifest V3 extension that captures REST traffic live: methods, status codes, timings, and payloads.",
      "Filtering, search, and JSON export.",
      "One-click cURL generation for any captured request.",
      "JWT detection in captured traffic.",
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
    stack: ["Next.js", "Express", "PostgreSQL", "Prisma"],
    date: "Oct 2025",
    featured: true,
    summary: "Accreditation compliance system — RBAC, 15+ REST APIs, audit logging on PostgreSQL.",
    problem: "Track accreditation evidence — publications, patents, and projects — in one audited system.",
    built: [
      "RBAC with 3 roles and JWT auth.",
      "6+ modules backed by 15+ REST APIs.",
      "10+ Prisma entities on PostgreSQL.",
      "Audit logging.",
    ],
    metrics: [
      { value: "15+", label: "REST APIs" },
      { value: "6+", label: "modules" },
      { value: "3", label: "RBAC roles" },
    ],
    links: { github: null, live: null }, // TODO
  },
  {
    slug: "carbon-credits",
    title: "Carbon Credit Trading Platform",
    category: "web",
    stack: ["React", "Node.js", "PostgreSQL/Prisma", "Ethereum Sepolia", "Python", "ESP32"],
    date: "2026",
    featured: true,
    status: "Capstone · in progress",
    summary: "Metered renewable generation becomes carbon credits, traded and settled on Ethereum.",
    problem: "Turn verified renewable generation into tradable carbon credits.",
    built: [
      "Node.js + PostgreSQL/Prisma backend that turns metered renewable generation into carbon credits.",
      "Trades are settled and anchored on Ethereum (Sepolia).",
      "React dashboard and ML-based price forecasting (Python).",
      "ESP32/Modbus meters record generation; devices authenticate with HMAC.",
    ],
    metrics: [
      { value: "Sepolia", label: "on-chain settlement" },
      { value: "HMAC", label: "device authentication" },
    ],
    links: { github: null, live: null }, // TODO
  },
  {
    slug: "technofluid",
    title: "TechnoFluid Lubricants Platform",
    category: "web",
    stack: ["Next.js", "Tailwind", "Firebase"],
    date: "2026",
    summary: "Client platform with a role-based admin dashboard and CMS, in production.",
    problem: "Let non-technical staff manage products and content themselves.",
    built: [
      "Role-based admin dashboard and CMS for products and content.",
      "Responsive UI across 15+ screens.",
      "Role-based access control and Firestore security rules to lock down admin operations.",
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
    stack: ["Next.js", "Firebase Auth", "Firestore"],
    date: "2026",
    summary: "Full-stack hotel booking platform with auth, bookings, and admin tooling.",
    problem: "A hotel booking platform with authentication, bookings, and admin tooling.",
    built: [
      "Authentication, booking flows, and admin tooling.",
      "14 responsive screens built from 28 reusable components.",
      "Firestore data model across 8 collections.",
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
    stack: ["Python", "sockets", "ThreadPoolExecutor"],
    date: "Sep 2026",
    summary: "Multithreaded TCP scanner with service inference and banner grabbing.",
    problem: "Scan all 65,535 TCP ports of a host quickly, and say what's listening.",
    built: [
      "Multithreaded TCP scanner covering all 65,535 ports.",
      "Hostname resolution, service inference, and banner grabbing.",
      "100 concurrent threads via ThreadPoolExecutor.",
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
    summary: "Cross-platform expense tracker with categories and budgets.",
    problem: "Track expenses and budgets on any phone.",
    built: [
      "Cross-platform expense tracker with 6 categories and budgets.",
      "15+ reusable components that cut UI build time by 40%.",
      "Express backend.",
    ],
    metrics: [
      { value: "40%", label: "faster UI build" },
      { value: "15+", label: "reusable components" },
      { value: "6", label: "categories" },
    ],
    links: { github: null, live: null }, // TODO
  },
  {
    slug: "railway-seat",
    title: "Railway Seat Verification System",
    category: "iot",
    stack: ["Node.js", "Express", "MongoDB", "ESP32"],
    date: "Aug 2025",
    status: "Patent application published",
    summary: "Real-time seat-status backend (Node.js/MongoDB) fed by ESP32 occupancy sensors.",
    problem: "Verify railway seat occupancy automatically and in real time.",
    built: [
      "Node.js/Express + MongoDB backend that syncs seat status live, with sub-second latency.",
      "Handles 100+ passenger records.",
      "ESP32 nodes detect seat occupancy and push updates to the backend.",
    ],
    metrics: [
      { value: "<1s", label: "seat status latency" },
      { value: "100+", label: "passenger records" },
      { value: "Patent", label: "Indian application published" },
    ],
    links: { github: null, live: null }, // TODO
    readout: [
      { label: "SEAT", text: "S4-42" },
      { label: "OCC", text: "YES" },
      { label: "SYNC", base: 0.42, jitter: 0.12, decimals: 2, unit: "s" },
    ],
  },
  {
    slug: "rfid-assets",
    title: "RFID Asset Management System",
    category: "iot",
    stack: ["Next.js", "Firebase", "ESP32", "RFID"],
    date: "May 2026",
    summary: "Next.js + Firebase asset dashboard with sub-second check-in/out from RFID scans.",
    problem: "Know where tagged assets are without manual logbooks.",
    built: [
      "Next.js dashboard backed by Firebase for 100+ tagged assets.",
      "Automated check-in/check-out — the database updates in under 1 second after a tag is detected.",
      "ESP32 + RFID reader on the edge.",
    ],
    metrics: [
      { value: "<1s", label: "tag → database" },
      { value: "100+", label: "tagged assets" },
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
    summary: "Cloud-logged energy monitoring with a live, historical dashboard.",
    problem: "Monitor voltage, current, power, and energy live, with history.",
    built: [
      "Cloud logging (Firebase) and a historical dashboard (Blynk) on 2-second refresh intervals.",
      "Sensor calibration brings accuracy to ±3–5%.",
      "ESP32 with SCT013 (current) and ZMPT101B (voltage) sensors.",
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
    summary: "Live GPS tracking map with route history on a Node.js backend.",
    problem: "Track a bicycle's position live and keep its route history.",
    built: [
      "Live map refreshing every 2 seconds, with route history on a Node.js backend.",
      "ESP32 with a NEO-6M GPS module (±5m accuracy).",
    ],
    metrics: [
      { value: "±5m", label: "GPS accuracy" },
      { value: "2s", label: "map refresh" },
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
      { name: "SQL", match: ["PostgreSQL", "PostgreSQL/Prisma"] },
      { name: "C/C++" },
    ],
  },
  {
    label: "Frontend",
    skills: [
      { name: "React", match: ["React"] },
      { name: "Next.js", match: ["Next.js"] },
      { name: "React Native", match: ["React Native"] },
      { name: "Three.js / R3F", match: ["Three.js", "R3F"] },
      { name: "Tailwind CSS", match: ["Tailwind", "NativeWind"] },
    ],
  },
  {
    label: "Backend & DB",
    skills: [
      { name: "Node.js", match: ["Node.js"] },
      { name: "Express", match: ["Express"] },
      { name: "PostgreSQL", match: ["PostgreSQL", "PostgreSQL/Prisma"] },
      { name: "Prisma", match: ["Prisma", "PostgreSQL/Prisma"] },
      { name: "MongoDB", match: ["MongoDB"] },
      { name: "Firebase", match: ["Firebase", "Firebase Auth", "Firestore"] },
    ],
  },
  {
    label: "Security & Networking",
    skills: [
      { name: "RBAC", projects: ["nbadms", "technofluid"] },
      { name: "JWT", projects: ["nbadms", "api-inspector"] },
      { name: "TCP/IP", match: ["sockets"] },
      { name: "Socket programming", match: ["sockets"] },
      { name: "Wireshark" },
    ],
  },
  {
    label: "Tools",
    skills: [
      { name: "Git" },
      { name: "GitHub" },
      { name: "Linux" },
      { name: "VS Code" },
      { name: "Figma" },
      { name: "VirtualBox" },
    ],
  },
  {
    label: "Embedded & IoT",
    skills: [
      { name: "ESP32", match: ["ESP32"] },
      { name: "Arduino" },
      { name: "RFID", match: ["RFID"] },
      { name: "NEO-6M GPS", match: ["NEO-6M GPS"] },
      { name: "Blynk IoT", match: ["Blynk"] },
      { name: "Current/voltage sensing", match: ["SCT013", "ZMPT101B"] },
    ],
  },
];

export const skillLabels = {
  graphTitle: "Skill ↔ project graph",
  graphHint: "Hover or focus a node to trace its connections.",
};

// ---------------------------------------------------------------------------
// Research & achievements
// ---------------------------------------------------------------------------

export const achievements = [
  {
    kind: "Patent",
    title: "IoT-enabled Railway Seat Verification System",
    detail: "Indian patent application No. 202511086732 A (published).",
  },
  {
    kind: "Academics",
    title: "Ranked 2nd in Electrical & Computer Engineering",
    detail: "Thapar Institute of Engineering and Technology — certificate + cash prize.",
  },
  {
    kind: "Scholarship",
    title: "Merit-based scholarship",
    detail: "Awarded for academic performance at TIET.",
  },
  {
    kind: "DSA",
    title: "250+ problems on LeetCode",
    detail: "Consistent practice in data structures and algorithms.",
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
