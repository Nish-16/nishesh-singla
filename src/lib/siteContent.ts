/**
 * Editable site content (managed from /admin, stored in Firestore as one JSON document).
 * `content.ts` provides the defaults; anything missing or malformed in Firestore falls back to them.
 */
import {
  about,
  achievements,
  experience,
  hero,
  identity,
  projects,
  sectionIntros,
  skillGroups,
  type Achievement,
  type Project,
  type Role,
  type SectionId,
  type SkillGroup,
  type Stat,
} from "@/content";

export interface SiteContent {
  identity: typeof identity;
  hero: { eyebrow: string };
  about: { bio: string[]; profileRole: string; stats: Stat[] };
  sectionIntros: Record<SectionId, string>;
  experience: Role[];
  projects: Project[];
  skillGroups: SkillGroup[];
  achievements: Achievement[];
}

/** Firestore location of the content document. Its single field `data` holds the JSON string. */
export const CONTENT_COLLECTION = "site";
export const CONTENT_DOC = "content";
export const HISTORY_COLLECTION = "site_history";
export const CONTENT_TAG = "site-content";

export const defaultContent: SiteContent = {
  identity,
  hero: { eyebrow: hero.eyebrow },
  about: { bio: about.bio, profileRole: about.profileRole, stats: about.stats },
  sectionIntros,
  experience,
  projects,
  skillGroups,
  achievements,
};

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const arr = <T>(v: unknown, fallback: T[]): T[] => (Array.isArray(v) ? (v as T[]) : fallback);

/** Merge (possibly partial / older-shaped) remote content over the defaults. */
export function mergeContent(remote: unknown): SiteContent {
  if (!isObj(remote)) return defaultContent;
  const d = defaultContent;
  const r = remote as Partial<Record<keyof SiteContent, unknown>>;
  const about = isObj(r.about) ? r.about : {};
  return {
    identity: { ...d.identity, ...(isObj(r.identity) ? (r.identity as Partial<SiteContent["identity"]>) : {}) },
    hero: { ...d.hero, ...(isObj(r.hero) ? (r.hero as Partial<SiteContent["hero"]>) : {}) },
    about: {
      bio: arr(about.bio, d.about.bio),
      profileRole: typeof about.profileRole === "string" ? about.profileRole : d.about.profileRole,
      stats: arr(about.stats, d.about.stats),
    },
    sectionIntros: { ...d.sectionIntros, ...(isObj(r.sectionIntros) ? (r.sectionIntros as Partial<SiteContent["sectionIntros"]>) : {}) },
    experience: arr(r.experience, d.experience),
    projects: arr(r.projects, d.projects),
    skillGroups: arr(r.skillGroups, d.skillGroups),
    achievements: arr(r.achievements, d.achievements),
  };
}

export function parseContentJson(json: string): SiteContent {
  try {
    return mergeContent(JSON.parse(json));
  } catch {
    return defaultContent;
  }
}
