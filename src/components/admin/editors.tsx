"use client";

import { projectCategories, sections, type Achievement, type Metric, type Project, type Role, type Skill, type SkillGroup, type Stat } from "@/content";
import type { SiteContent } from "@/lib/siteContent";
import { AddButton, Area, Card, Grid, Num, PairList, Select, StringList, TagInput, Text, Toggle } from "./fields";
import { Icon } from "./icons";
import { MasterDetail } from "./MasterDetail";

type Edit<T> = { value: T; onChange: (v: T) => void };
type Selectable = { selected: number; onSelect: (i: number) => void };

export type TabId = "profile" | "experience" | "projects" | "skills" | "achievements" | "intros" | "json" | "messages";
export type Issue = { tab: TabId; index: number; message: string };

// ---------------------------------------------------------------------------
// Validation (blocks saving so the live site never gets broken data)
// ---------------------------------------------------------------------------

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function projectIssues(p: Project, i: number, all: Project[]): string[] {
  const out: string[] = [];
  if (!p.title.trim()) out.push("Title is required.");
  if (!p.slug.trim()) out.push("Slug is required.");
  else if (!SLUG.test(p.slug)) out.push("Slug: lowercase letters, numbers and dashes only.");
  else if (all.some((q, j) => j !== i && q.slug === p.slug)) out.push(`Slug "${p.slug}" is used by another project.`);
  return out;
}

export function findIssues(c: SiteContent): Issue[] {
  const issues: Issue[] = [];
  if (!c.identity.name.trim()) issues.push({ tab: "profile", index: 0, message: "Name is required." });
  c.experience.forEach((r, i) => {
    if (!r.title.trim() || !r.org.trim()) issues.push({ tab: "experience", index: i, message: `Role ${i + 1}: title and organisation are required.` });
  });
  c.projects.forEach((p, i) => projectIssues(p, i, c.projects).forEach((m) => issues.push({ tab: "projects", index: i, message: `${p.title || `Project ${i + 1}`}: ${m}` })));
  c.skillGroups.forEach((g, i) => {
    if (!g.label.trim()) issues.push({ tab: "skills", index: i, message: `Skill group ${i + 1} needs a name.` });
  });
  c.achievements.forEach((a, i) => {
    if (!a.title.trim()) issues.push({ tab: "achievements", index: i, message: `Achievement ${i + 1} needs a title.` });
  });
  return issues;
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export function ProfileEditor({ value, onChange }: Edit<SiteContent>) {
  const id = value.identity;
  const setId = (patch: Partial<typeof id>) => onChange({ ...value, identity: { ...id, ...patch } });
  const about = value.about;
  const setAbout = (patch: Partial<typeof about>) => onChange({ ...value, about: { ...about, ...patch } });

  return (
    <div className="flex flex-col gap-5">
      <Card title="Hero" description="The first thing visitors see.">
        <Grid>
          <Text label="Full name" value={id.name} onChange={(v) => setId({ name: v })} error={!id.name.trim() ? "Required." : undefined} />
          <Text label="Short name" hint="Shown in the header on mobile." value={id.firstName} onChange={(v) => setId({ firstName: v })} />
        </Grid>
        <Text label="Eyebrow" hint="Small line above your name." value={value.hero.eyebrow} onChange={(v) => onChange({ ...value, hero: { ...value.hero, eyebrow: v } })} />
        <Area label="Tagline" soft={160} value={id.tagline} onChange={(v) => setId({ tagline: v })} />
      </Card>

      <Card title="About" description="The bio paragraphs and the profile.json card.">
        <StringList label="Bio paragraphs" addLabel="Add paragraph" value={about.bio} onChange={(v) => setAbout({ bio: v })} />
        <Text label="Role" hint='Shown as "role" in profile.json.' value={about.profileRole} onChange={(v) => setAbout({ profileRole: v })} />
      </Card>

      <Card title="Education" description="Shown under the bio.">
        <Text label="School" value={about.education.school} onChange={(v) => setAbout({ education: { ...about.education, school: v } })} />
        <Grid>
          <Text label="Degree" value={about.education.degree} onChange={(v) => setAbout({ education: { ...about.education, degree: v } })} />
          <Text label="Dates" placeholder="Sep 2023 – Jun 2027" value={about.education.dates} onChange={(v) => setAbout({ education: { ...about.education, dates: v } })} />
        </Grid>
        <Text label="Location" value={about.education.location} onChange={(v) => setAbout({ education: { ...about.education, location: v } })} />
        <TagInput label="Relevant coursework" value={about.education.coursework} onChange={(v) => setAbout({ education: { ...about.education, coursework: v } })} />
      </Card>

      <Card title="profile.json stats" description="Numbers count up when scrolled into view.">
        <StatsEditor value={about.stats} onChange={(stats) => setAbout({ stats })} />
      </Card>

      <Card title="Contact & links">
        <Grid>
          <Text label="Email" value={id.email} onChange={(v) => setId({ email: v })} />
          <Text label="Location" value={id.location} onChange={(v) => setId({ location: v })} />
          <Text label="LinkedIn URL" mono value={id.linkedin} onChange={(v) => setId({ linkedin: v })} />
          <Text label="LinkedIn label" value={id.linkedinLabel} onChange={(v) => setId({ linkedinLabel: v })} />
          <Text label="GitHub URL" mono value={id.github} onChange={(v) => setId({ github: v })} />
          <Text label="GitHub label" value={id.githubLabel} onChange={(v) => setId({ githubLabel: v })} />
        </Grid>
        <Text label="Availability" hint="Contact section + social preview." value={id.status} onChange={(v) => setId({ status: v })} />
        <Text label="Social preview tagline" hint="Used in the link preview image." value={id.altTagline} onChange={(v) => setId({ altTagline: v })} />
      </Card>
    </div>
  );
}

function StatsEditor({ value, onChange }: Edit<Stat[]>) {
  const set = (i: number, patch: Partial<Stat>) => onChange(value.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  return (
    <div className="flex flex-col gap-3">
      {value.map((s, i) => (
        <div key={i} className="rounded-lg border border-line bg-canvas p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[13px] text-ink">
              &quot;{s.key}&quot;: <span className="text-accent">{`${s.prefix ?? ""}${s.value}${s.suffix ?? ""}`}</span>
            </span>
            <button type="button" aria-label="Remove stat" onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-muted hover:text-accent">
              <Icon name="x" size={14} />
            </button>
          </div>
          <Grid cols={3}>
            <Text label="Key" mono value={s.key} onChange={(v) => set(i, { key: v })} />
            <Num label="Value" value={s.value} onChange={(v) => set(i, { value: v ?? 0 })} />
            <Num label="Decimals" value={s.decimals} onChange={(v) => set(i, { decimals: v })} />
            <Text label="Prefix" placeholder="#" value={s.prefix ?? ""} onChange={(v) => set(i, { prefix: v || undefined })} />
            <Text label="Suffix" placeholder="+" value={s.suffix ?? ""} onChange={(v) => set(i, { suffix: v || undefined })} />
            <Text label="Comment" value={s.note ?? ""} onChange={(v) => set(i, { note: v || undefined })} />
          </Grid>
        </div>
      ))}
      <AddButton onClick={() => onChange([...value, { key: "new_stat", value: 0 }])}>Add stat</AddButton>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Experience
// ---------------------------------------------------------------------------

export function ExperienceEditor({ value, onChange, selected, onSelect }: Edit<Role[]> & Selectable) {
  return (
    <MasterDetail<Role>
      items={value}
      onChange={onChange}
      noun="role"
      selected={selected}
      onSelect={onSelect}
      newItem={() => ({ title: "", org: "", kind: "work", period: "", location: "", stack: [], bullets: [""] })}
      title={(r) => r.title}
      meta={(r) => [r.org, r.period].filter(Boolean).join(" · ")}
      badge={(r) => (r.kind === "leadership" ? <Pill>Leadership</Pill> : null)}
      search={(r) => `${r.title} ${r.org} ${r.period}`}
      issues={(r) => (!r.title.trim() || !r.org.trim() ? ["Title and organisation are required."] : [])}
      render={(r, set) => (
        <>
          <Grid>
            <Text label="Title" placeholder="Summer Intern" value={r.title} onChange={(v) => set({ ...r, title: v })} />
            <Text label="Organisation" placeholder="Thapar Institute" value={r.org} onChange={(v) => set({ ...r, org: v })} />
            <Text label="Period" placeholder="Jun 2025 – Jul 2025" value={r.period} onChange={(v) => set({ ...r, period: v })} />
            <Text label="Location" placeholder="Patiala" value={r.location} onChange={(v) => set({ ...r, location: v })} />
          </Grid>
          <Text label="One-line summary" hint="Shown under the title." value={r.summary ?? ""} onChange={(v) => set({ ...r, summary: v || undefined })} />
          <Select
            label="Type"
            hint="Leadership roles show in the Leadership section instead of the timeline."
            value={r.kind}
            options={[
              { value: "work", label: "Work" },
              { value: "leadership", label: "Leadership" },
            ]}
            onChange={(v) => set({ ...r, kind: v })}
          />
          <TagInput label="Stack" value={r.stack} onChange={(v) => set({ ...r, stack: v })} />
          <StringList label="Bullets" addLabel="Add bullet" placeholder="What you did and the result" value={r.bullets} onChange={(v) => set({ ...r, bullets: v })} />
        </>
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

const catLabel = (id: Project["category"]) => projectCategories.find((c) => c.id === id)?.label ?? id;
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function ProjectsEditor({ value, onChange, selected, onSelect }: Edit<Project[]> & Selectable) {
  return (
    <MasterDetail<Project>
      items={value}
      onChange={onChange}
      noun="project"
      selected={selected}
      onSelect={onSelect}
      newItem={() => ({
        slug: "",
        title: "",
        category: "web",
        stack: [],
        date: "",
        summary: "",
        problem: "",
        built: [""],
        metrics: [],
        links: { github: null, live: null },
      })}
      title={(p) => p.title}
      meta={(p) => [catLabel(p.category), p.date].filter(Boolean).join(" · ")}
      badge={(p) => (p.featured ? <Icon name="star" size={12} className="fill-current text-accent" /> : null)}
      search={(p) => `${p.title} ${p.stack.join(" ")} ${catLabel(p.category)}`}
      issues={(p, i) => projectIssues(p, i, value)}
      viewHref={(p) => (p.slug ? `/#project-${p.slug}` : null)}
      render={(p, set) => (
        <>
          <Grid>
            <Text
              label="Title"
              value={p.title}
              onChange={(v) => set({ ...p, title: v, slug: p.slug || !v ? p.slug : slugify(v) })}
            />
            <Text label="Slug" mono hint="URL id: /#project-slug" value={p.slug} onChange={(v) => set({ ...p, slug: slugify(v) || v.toLowerCase() })} />
            <Select label="Category" value={p.category} options={projectCategories.map((c) => ({ value: c.id, label: c.label }))} onChange={(v) => set({ ...p, category: v })} />
            <Text label="Date" placeholder="Jun 2026" value={p.date} onChange={(v) => set({ ...p, date: v })} />
          </Grid>
          <Toggle label="Featured" description="Shows as a larger card." value={p.featured} onChange={(v) => set({ ...p, featured: v || undefined })} />
          <Text label="Status" hint="Optional, e.g. In progress." value={p.status ?? ""} onChange={(v) => set({ ...p, status: v || undefined })} />
          <Text label="Context" hint="Optional, e.g. Freelance client work via Humble Solutions." value={p.context ?? ""} onChange={(v) => set({ ...p, context: v || undefined })} />
          <Area label="Card summary" soft={110} value={p.summary} onChange={(v) => set({ ...p, summary: v })} />
          <Area label="Problem" value={p.problem} onChange={(v) => set({ ...p, problem: v })} />
          <StringList label="What I built" addLabel="Add point" value={p.built} onChange={(v) => set({ ...p, built: v })} />
          <PairList<Metric & Record<string, string>>
            label="Key numbers"
            hint="The first one shows on the card."
            keys={["value", "label"]}
            headings={["Value", "Label"]}
            placeholders={["30%", "faster scene loads"]}
            addLabel="Add number"
            value={p.metrics as (Metric & Record<string, string>)[]}
            onChange={(v) => set({ ...p, metrics: v })}
          />
          <TagInput label="Stack" value={p.stack} onChange={(v) => set({ ...p, stack: v })} />
          <Grid>
            <Text label="GitHub URL" mono placeholder="https://github.com/…" value={p.links.github ?? ""} onChange={(v) => set({ ...p, links: { ...p.links, github: v || null } })} />
            <Text label="Live URL" mono placeholder="https://…" value={p.links.live ?? ""} onChange={(v) => set({ ...p, links: { ...p.links, live: v || null } })} />
          </Grid>
        </>
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

export function SkillsEditor({ value, onChange, selected, onSelect }: Edit<SkillGroup[]> & Selectable) {
  return (
    <MasterDetail<SkillGroup>
      items={value}
      onChange={onChange}
      noun="group"
      selected={selected}
      onSelect={onSelect}
      newItem={() => ({ label: "", skills: [] })}
      title={(g) => g.label}
      meta={(g) => `${g.skills.length} skill${g.skills.length === 1 ? "" : "s"}`}
      issues={(g) => (!g.label.trim() ? ["Group name is required."] : [])}
      render={(g, set) => (
        <>
          <Text label="Group name" value={g.label} onChange={(v) => set({ ...g, label: v })} />
          <SkillRows value={g.skills} onChange={(skills) => set({ ...g, skills })} />
        </>
      )}
    />
  );
}

function SkillRows({ value, onChange }: Edit<Skill[]>) {
  const set = (i: number, next: Skill) => onChange(value.map((s, j) => (j === i ? next : s)));
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-ink">Skills</span>
      {value.map((s, i) => (
        <details key={i} className="group rounded-lg border border-line bg-canvas">
          <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2">
            <input
              aria-label={`Skill ${i + 1}`}
              value={s.name}
              onClick={(e) => e.preventDefault()}
              onKeyDown={(e) => e.key === " " && e.stopPropagation()}
              onChange={(e) => set(i, { ...s, name: e.target.value })}
              className="h-8 min-w-0 flex-1 rounded-md bg-transparent px-2 text-sm text-ink focus:bg-surface focus:outline-none"
            />
            <span className="font-mono text-[11px] text-muted">
              {(s.match?.length ?? 0) + (s.projects?.length ?? 0) > 0 ? "linked" : "graph links"} <span className="group-open:hidden">▾</span>
              <span className="hidden group-open:inline">▴</span>
            </span>
            <button
              type="button"
              aria-label="Remove skill"
              onClick={(e) => {
                e.preventDefault();
                onChange(value.filter((_, j) => j !== i));
              }}
              className="text-muted hover:text-accent"
            >
              <Icon name="x" size={14} />
            </button>
          </summary>
          <div className="flex flex-col gap-4 border-t border-line px-3 py-3">
            <TagInput
              label="Matches project stack items"
              hint="The skill graph links this skill to projects whose stack contains any of these."
              value={s.match}
              onChange={(v) => set(i, { ...s, match: v.length ? v : undefined })}
            />
            <TagInput label="Also link to project slugs" value={s.projects} onChange={(v) => set(i, { ...s, projects: v.length ? v : undefined })} />
          </div>
        </details>
      ))}
      <AddButton onClick={() => onChange([...value, { name: "" }])}>Add skill</AddButton>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Achievements & intros
// ---------------------------------------------------------------------------

export function AchievementsEditor({ value, onChange, selected, onSelect }: Edit<Achievement[]> & Selectable) {
  return (
    <MasterDetail<Achievement>
      items={value}
      onChange={onChange}
      noun="achievement"
      selected={selected}
      onSelect={onSelect}
      newItem={() => ({ kind: "", title: "", detail: "" })}
      title={(a) => a.title}
      meta={(a) => a.kind}
      issues={(a) => (!a.title.trim() ? ["Title is required."] : [])}
      render={(a, set) => (
        <>
          <Text label="Type" placeholder="Patent, Award, Academics…" value={a.kind} onChange={(v) => set({ ...a, kind: v })} />
          <Text label="Title" value={a.title} onChange={(v) => set({ ...a, title: v })} />
          <Area label="Detail" value={a.detail} onChange={(v) => set({ ...a, detail: v })} />
        </>
      )}
    />
  );
}

export function IntrosEditor({ value, onChange }: Edit<SiteContent["sectionIntros"]>) {
  return (
    <Card title="Section intros" description="The large line under each section heading.">
      {sections.map((s) => (
        <Area key={s.id} label={`~/${s.label.toLowerCase()}`} soft={80} value={value[s.id]} onChange={(v) => onChange({ ...value, [s.id]: v })} />
      ))}
    </Card>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="shrink-0 rounded border border-line px-1.5 py-px font-mono text-[10px] text-muted">{children}</span>;
}
