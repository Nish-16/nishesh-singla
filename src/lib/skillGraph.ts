import { projects, skillGroups, type Project } from "@/content";

export type GraphNode = {
  id: string;
  label: string;
  kind: "skill" | "project";
  category?: Project["category"];
  x: number;
  y: number;
};

export type GraphLink = { source: string; target: string };

export const GRAPH_W = 960;
export const GRAPH_H = 700;

/** Which projects use a skill, derived from project stacks (+ explicit extras in content). */
export function projectsForSkill(skill: { match?: string[]; projects?: string[] }): string[] {
  const set = new Set(skill.projects ?? []);
  if (skill.match) {
    for (const p of projects) if (p.stack.some((t) => skill.match!.includes(t))) set.add(p.slug);
  }
  return [...set];
}

const shortTitle = (t: string) => t.split(" — ")[0].replace(/ System$/, "").replace(/ Platform$/, "");

/** Deterministic force layout computed once (no animation loop needed). */
export function buildSkillGraph(): { nodes: GraphNode[]; links: GraphLink[] } {
  const links: GraphLink[] = [];
  const skillNodes: GraphNode[] = [];
  const seen = new Set<string>();

  for (const g of skillGroups) {
    for (const s of g.skills) {
      const ps = projectsForSkill(s);
      if (!ps.length || seen.has(s.name)) continue;
      seen.add(s.name);
      const id = `s:${s.name}`;
      skillNodes.push({ id, label: s.name, kind: "skill", x: 0, y: 0 });
      ps.forEach((slug) => links.push({ source: id, target: `p:${slug}` }));
    }
  }

  const cx = GRAPH_W / 2;
  const cy = GRAPH_H / 2;
  const projectNodes: GraphNode[] = projects.map((p, i) => {
    const a = (i / projects.length) * Math.PI * 2;
    return { id: `p:${p.slug}`, label: shortTitle(p.title), kind: "project", category: p.category, x: cx + Math.cos(a) * 170, y: cy + Math.sin(a) * 150 };
  });
  const byId = new Map<string, GraphNode>(projectNodes.map((n) => [n.id, n]));

  // Start each skill near the average of the projects it links to, pushed outward.
  skillNodes.forEach((s, i) => {
    const targets = links.filter((l) => l.source === s.id).map((l) => byId.get(l.target)!);
    const mx = targets.reduce((a, n) => a + n.x, 0) / targets.length;
    const my = targets.reduce((a, n) => a + n.y, 0) / targets.length;
    const dx = mx - cx || Math.cos(i);
    const dy = my - cy || Math.sin(i);
    const d = Math.hypot(dx, dy) || 1;
    s.x = cx + (dx / d) * 300 + Math.cos(i * 2.4) * 30;
    s.y = cy + (dy / d) * 240 + Math.sin(i * 2.4) * 30;
  });

  const nodes = [...projectNodes, ...skillNodes];
  nodes.forEach((n) => byId.set(n.id, n));
  const vx = new Map(nodes.map((n) => [n.id, 0]));
  const vy = new Map(nodes.map((n) => [n.id, 0]));

  for (let iter = 0; iter < 360; iter++) {
    const alpha = 1 - iter / 360;
    // repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1) {
          dx = 1;
          dy = 0;
          d2 = 1;
        }
        const d = Math.sqrt(d2);
        const f = ((a.kind === "project" && b.kind === "project" ? 16000 : 9000) * alpha) / d2;
        vx.set(a.id, vx.get(a.id)! - (dx / d) * f);
        vy.set(a.id, vy.get(a.id)! - (dy / d) * f);
        vx.set(b.id, vx.get(b.id)! + (dx / d) * f);
        vy.set(b.id, vy.get(b.id)! + (dy / d) * f);
      }
    }
    // springs
    for (const l of links) {
      const a = byId.get(l.source)!;
      const b = byId.get(l.target)!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 1;
      const f = (d - 140) * 0.02 * alpha;
      vx.set(a.id, vx.get(a.id)! + (dx / d) * f);
      vy.set(a.id, vy.get(a.id)! + (dy / d) * f);
      vx.set(b.id, vx.get(b.id)! - (dx / d) * f);
      vy.set(b.id, vy.get(b.id)! - (dy / d) * f);
    }
    // gravity + integrate
    for (const n of nodes) {
      let x = vx.get(n.id)! + (cx - n.x) * 0.004 * alpha;
      let y = vy.get(n.id)! + (cy - n.y) * 0.006 * alpha;
      x *= 0.6;
      y *= 0.6;
      vx.set(n.id, x);
      vy.set(n.id, y);
      n.x = Math.min(GRAPH_W - 70, Math.max(70, n.x + x));
      n.y = Math.min(GRAPH_H - 30, Math.max(30, n.y + y));
    }
  }

  // Round so server and client render identical SVG attributes (avoids hydration mismatches).
  for (const n of nodes) {
    n.x = Math.round(n.x * 10) / 10;
    n.y = Math.round(n.y * 10) / 10;
  }
  return { nodes, links };
}
