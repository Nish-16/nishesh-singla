"use client";

import {
  projectCategories,
  sections,
  type Achievement,
  type Metric,
  type Project,
  type Role,
  type Skill,
  type SkillGroup,
  type Stat,
} from "@/content";
import type { SiteContent } from "@/lib/siteContent";
import { Area, Check, Grid, Lines, ListEditor, Num, Select, Tags, Text } from "./fields";

type Edit<T> = { value: T; onChange: (v: T) => void };

// "30% | faster scene loads" per line  <->  Metric[]
function MetricsField({ value, onChange }: Edit<Metric[]>) {
  return (
    <Lines
      label="Key numbers"
      hint={'One per line as "value | label", e.g. "30% | faster scene loads". The first one shows on the card.'}
      value={value.map((m) => `${m.value} | ${m.label}`)}
      onChange={(lines) =>
        onChange(
          lines.map((l) => {
            const [v, ...rest] = l.split("|");
            return { value: v.trim(), label: rest.join("|").trim() };
          }),
        )
      }
    />
  );
}

export function ProfileEditor({ value, onChange }: Edit<SiteContent>) {
  const id = value.identity;
  const setId = (patch: Partial<typeof id>) => onChange({ ...value, identity: { ...id, ...patch } });
  const about = value.about;
  const setAbout = (patch: Partial<typeof about>) => onChange({ ...value, about: { ...about, ...patch } });

  return (
    <div className="flex flex-col gap-8">
      <Block title="Identity">
        <Grid>
          <Text label="Full name" value={id.name} onChange={(v) => setId({ name: v })} />
          <Text label="First name (mobile header)" value={id.firstName} onChange={(v) => setId({ firstName: v })} />
          <Text label="Hero eyebrow" value={value.hero.eyebrow} onChange={(v) => onChange({ ...value, hero: { ...value.hero, eyebrow: v } })} />
          <Text label="Location" value={id.location} onChange={(v) => setId({ location: v })} />
        </Grid>
        <Area label="Tagline (hero)" value={id.tagline} onChange={(v) => setId({ tagline: v })} />
        <Text label="Short tagline (social preview)" value={id.altTagline} onChange={(v) => setId({ altTagline: v })} />
        <Text label="Status" value={id.status} onChange={(v) => setId({ status: v })} />
      </Block>

      <Block title="Links">
        <Grid>
          <Text label="Email" value={id.email} onChange={(v) => setId({ email: v })} />
          <span />
          <Text label="LinkedIn URL" value={id.linkedin} onChange={(v) => setId({ linkedin: v })} />
          <Text label="LinkedIn label" value={id.linkedinLabel} onChange={(v) => setId({ linkedinLabel: v })} />
          <Text label="GitHub URL" value={id.github} onChange={(v) => setId({ github: v })} />
          <Text label="GitHub label" value={id.githubLabel} onChange={(v) => setId({ githubLabel: v })} />
        </Grid>
      </Block>

      <Block title="About">
        <Lines label="Bio paragraphs" hint="One paragraph per line." rows={7} value={about.bio} onChange={(v) => setAbout({ bio: v })} />
        <Text label="Role (profile.json)" value={about.profileRole} onChange={(v) => setAbout({ profileRole: v })} />
      </Block>

      <Block title="profile.json stats">
        <ListEditor<Stat>
          items={about.stats}
          onChange={(stats) => setAbout({ stats })}
          newItem={() => ({ key: "new_stat", value: 0 })}
          itemLabel={(s) => `${s.key}: ${s.prefix ?? ""}${s.value}${s.suffix ?? ""}`}
          addLabel="Add stat"
          render={(s, set) => (
            <Grid>
              <Text label="Key" hint="Shown as the JSON key, e.g. leetcode" value={s.key} onChange={(v) => set({ ...s, key: v })} />
              <Num label="Value" hint="Counts up from 0" value={s.value} onChange={(v) => set({ ...s, value: v ?? 0 })} />
              <Num label="Decimals" value={s.decimals} onChange={(v) => set({ ...s, decimals: v })} />
              <Text label="Prefix" value={s.prefix ?? ""} onChange={(v) => set({ ...s, prefix: v || undefined })} />
              <Text label="Suffix" value={s.suffix ?? ""} onChange={(v) => set({ ...s, suffix: v || undefined })} />
              <Text label="Comment" value={s.note ?? ""} onChange={(v) => set({ ...s, note: v || undefined })} />
            </Grid>
          )}
        />
      </Block>
    </div>
  );
}

export function ExperienceEditor({ value, onChange }: Edit<Role[]>) {
  return (
    <ListEditor<Role>
      items={value}
      onChange={onChange}
      newItem={() => ({ title: "", org: "", kind: "work", period: "", location: "", stack: [], bullets: [] })}
      itemLabel={(r) => [r.title, r.org].filter(Boolean).join(" · ")}
      addLabel="Add role"
      render={(r, set) => (
        <>
          <Grid>
            <Text label="Title" value={r.title} onChange={(v) => set({ ...r, title: v })} />
            <Text label="Organisation" value={r.org} onChange={(v) => set({ ...r, org: v })} />
            <Text label="Period" placeholder="May 2025 – Jul 2025" value={r.period} onChange={(v) => set({ ...r, period: v })} />
            <Text label="Location" value={r.location} onChange={(v) => set({ ...r, location: v })} />
            <Select
              label="Type"
              value={r.kind}
              options={[
                { value: "work", label: "Work" },
                { value: "leadership", label: "Leadership" },
              ]}
              onChange={(v) => set({ ...r, kind: v })}
            />
          </Grid>
          <Tags label="Stack" value={r.stack} onChange={(v) => set({ ...r, stack: v })} />
          <Lines label="Bullets" rows={5} value={r.bullets} onChange={(v) => set({ ...r, bullets: v })} />
        </>
      )}
    />
  );
}

export function ProjectsEditor({ value, onChange }: Edit<Project[]>) {
  return (
    <ListEditor<Project>
      items={value}
      onChange={onChange}
      newItem={() => ({
        slug: `project-${Date.now().toString(36)}`,
        title: "",
        category: "web",
        stack: [],
        date: "",
        summary: "",
        problem: "",
        built: [],
        metrics: [],
        links: { github: null, live: null },
      })}
      itemLabel={(p) => `${p.featured ? "★ " : ""}${p.title}`}
      addLabel="Add project"
      render={(p, set) => (
        <>
          <Grid>
            <Text label="Title" value={p.title} onChange={(v) => set({ ...p, title: v })} />
            <Text label="Slug (URL id)" hint="Lowercase, dashes. Used in /#project-slug" value={p.slug} onChange={(v) => set({ ...p, slug: v })} />
            <Select
              label="Category"
              value={p.category}
              options={projectCategories.map((c) => ({ value: c.id, label: c.label }))}
              onChange={(v) => set({ ...p, category: v })}
            />
            <Text label="Date" placeholder="Jun 2026" value={p.date} onChange={(v) => set({ ...p, date: v })} />
            <Text
              label="Status (optional)"
              placeholder="In progress"
              value={p.status ?? ""}
              onChange={(v) => set({ ...p, status: v || undefined })}
            />
            <div className="flex items-end pb-2">
              <Check label="Featured (bigger card)" value={p.featured} onChange={(v) => set({ ...p, featured: v || undefined })} />
            </div>
          </Grid>
          <Area label="Card summary" rows={2} value={p.summary} onChange={(v) => set({ ...p, summary: v })} />
          <Area label="Problem" rows={2} value={p.problem} onChange={(v) => set({ ...p, problem: v })} />
          <Lines label="What I built" rows={5} value={p.built} onChange={(v) => set({ ...p, built: v })} />
          <MetricsField value={p.metrics} onChange={(v) => set({ ...p, metrics: v })} />
          <Tags label="Stack" value={p.stack} onChange={(v) => set({ ...p, stack: v })} />
          <Grid>
            <Text label="GitHub URL" value={p.links.github ?? ""} onChange={(v) => set({ ...p, links: { ...p.links, github: v || null } })} />
            <Text label="Live URL" value={p.links.live ?? ""} onChange={(v) => set({ ...p, links: { ...p.links, live: v || null } })} />
          </Grid>
        </>
      )}
    />
  );
}

export function SkillsEditor({ value, onChange }: Edit<SkillGroup[]>) {
  return (
    <ListEditor<SkillGroup>
      items={value}
      onChange={onChange}
      newItem={() => ({ label: "", skills: [] })}
      itemLabel={(g) => `${g.label} (${g.skills.length})`}
      addLabel="Add group"
      render={(g, set) => (
        <>
          <Text label="Group name" value={g.label} onChange={(v) => set({ ...g, label: v })} />
          <ListEditor<Skill>
            items={g.skills}
            onChange={(skills) => set({ ...g, skills })}
            newItem={() => ({ name: "" })}
            itemLabel={(s) => s.name}
            addLabel="Add skill"
            render={(s, setSkill) => (
              <>
                <Text label="Skill" value={s.name} onChange={(v) => setSkill({ ...s, name: v })} />
                <Tags
                  label="Matches project stack items (graph)"
                  hint="If a project's stack contains any of these, the graph links them. e.g. React, R3F"
                  value={s.match}
                  onChange={(v) => setSkill({ ...s, match: v.length ? v : undefined })}
                />
                <Tags
                  label="Also linked to project slugs (graph)"
                  value={s.projects}
                  onChange={(v) => setSkill({ ...s, projects: v.length ? v : undefined })}
                />
              </>
            )}
          />
        </>
      )}
    />
  );
}

export function AchievementsEditor({ value, onChange }: Edit<Achievement[]>) {
  return (
    <ListEditor<Achievement>
      items={value}
      onChange={onChange}
      newItem={() => ({ kind: "", title: "", detail: "" })}
      itemLabel={(a) => a.title}
      addLabel="Add achievement"
      render={(a, set) => (
        <>
          <Text label="Type" placeholder="Patent, Award, Academics…" value={a.kind} onChange={(v) => set({ ...a, kind: v })} />
          <Text label="Title" value={a.title} onChange={(v) => set({ ...a, title: v })} />
          <Area label="Detail" rows={2} value={a.detail} onChange={(v) => set({ ...a, detail: v })} />
        </>
      )}
    />
  );
}

export function IntrosEditor({ value, onChange }: Edit<SiteContent["sectionIntros"]>) {
  return (
    <div className="flex flex-col gap-4">
      {sections.map((s) => (
        <Area key={s.id} label={`~/${s.label.toLowerCase()}`} rows={2} value={value[s.id]} onChange={(v) => onChange({ ...value, [s.id]: v })} />
      ))}
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {children}
    </section>
  );
}
