/**
 * Layout for the hero's system-architecture graph, shared by the 3D scene and the 2D fallback.
 * Columns flow left → right: client → edge → services → data.
 */
import { hero } from "@/content";

export type Vec3 = [number, number, number];
export type ArchNodeId = keyof typeof hero.graph;

export interface ArchNode {
  id: ArchNodeId;
  label: string;
  sub: string;
  pos: Vec3;
}

export const NODE_W = 2.1;
export const NODE_H = 0.82;

const POS: Record<ArchNodeId, Vec3> = {
  client: [-4.7, 0.1, 0.2],
  next: [-1.85, 0.1, 0.7],
  auth: [1.0, 1.95, -0.3],
  api: [1.0, 0.1, 0.9],
  fn: [1.0, -1.75, -0.1],
  pg: [3.95, 1.35, 0.3],
  mongo: [3.95, -0.35, -0.4],
  fs: [3.95, -2.05, 0.5],
};

export const ARCH_NODES: ArchNode[] = (Object.keys(POS) as ArchNodeId[]).map((id) => ({
  id,
  label: hero.graph[id].label,
  sub: hero.graph[id].sub,
  pos: POS[id],
}));

export const ARCH_EDGES: [ArchNodeId, ArchNodeId][] = [
  ["client", "next"],
  ["next", "auth"],
  ["next", "api"],
  ["next", "fn"],
  ["api", "auth"],
  ["api", "pg"],
  ["api", "mongo"],
  ["auth", "pg"],
  ["fn", "fs"],
];

const byId = new Map(ARCH_NODES.map((n) => [n.id, n]));

/**
 * Cubic Bézier control points for an edge. Horizontal edges leave the right side of `a` and enter the left
 * side of `b`; edges within a column (e.g. api → auth) run vertically between top/bottom faces.
 */
export function edgeControlPoints(a: ArchNodeId, b: ArchNodeId): [Vec3, Vec3, Vec3, Vec3] {
  const A = byId.get(a)!.pos;
  const B = byId.get(b)!.pos;
  if (Math.abs(B[0] - A[0]) < 0.5) {
    const dir = Math.sign(B[1] - A[1]) || 1;
    const p0: Vec3 = [A[0] + 0.55, A[1] + (dir * NODE_H) / 2, A[2]];
    const p3: Vec3 = [B[0] + 0.55, B[1] - (dir * NODE_H) / 2, B[2]];
    const k = Math.abs(p3[1] - p0[1]) * 0.45;
    return [p0, [p0[0], p0[1] + dir * k, p0[2]], [p3[0], p3[1] - dir * k, p3[2]], p3];
  }
  const p0: Vec3 = [A[0] + NODE_W / 2, A[1], A[2]];
  const p3: Vec3 = [B[0] - NODE_W / 2, B[1], B[2]];
  const k = (p3[0] - p0[0]) * 0.5;
  return [p0, [p0[0] + k, p0[1], p0[2]], [p3[0] - k, p3[1], p3[2]], p3];
}

export function bezier(p: [Vec3, Vec3, Vec3, Vec3], t: number): Vec3 {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [0, 1, 2].map((i) => a * p[0][i] + b * p[1][i] + c * p[2][i] + d * p[3][i]) as Vec3;
}
