"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ARCH_EDGES, ARCH_NODES, NODE_H, NODE_W, bezier, edgeControlPoints, type ArchNode, type ArchNodeId } from "@/lib/arch";
import type { Palette } from "@/lib/theme";

/** Shared, mutable scene state kept out of React (only one hero scene exists). */
const state = { hovered: null as ArchNodeId | null };

const touches = (edge: [ArchNodeId, ArchNodeId], id: ArchNodeId | null) => !!id && (edge[0] === id || edge[1] === id);

const CURVES = ARCH_EDGES.map(([a, b]) => edgeControlPoints(a, b));

// ---------------------------------------------------------------------------
// Node card label (canvas texture, no font network requests)
// ---------------------------------------------------------------------------

function makeLabelTexture(node: ArchNode, p: Palette): THREE.CanvasTexture {
  const W = 512;
  const H = 200;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;

  const draw = () => {
    const g = c.getContext("2d")!;
    const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-jetbrains-mono").trim() || "monospace";
    g.clearRect(0, 0, W, H);
    g.fillStyle = p.accent;
    g.fillRect(34, 64, 20, 20);
    g.fillStyle = p.ink;
    g.font = `700 60px ${mono}`;
    g.textBaseline = "middle";
    g.fillText(node.label, 74, 76);
    g.fillStyle = p.muted;
    g.font = `500 32px ${mono}`;
    g.fillText(node.sub, 34, 142);
    tex.needsUpdate = true;
  };
  draw();
  document.fonts?.ready.then(draw);
  return tex;
}

function NodeCard({ node, palette }: { node: ArchNode; palette: Palette }) {
  const label = useMemo(() => makeLabelTexture(node, palette), [node, palette]);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(NODE_W, NODE_H, 0.16)), []);
  const edgeMat = useRef<THREE.LineBasicMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const base = useMemo(() => new THREE.Color(palette.lineStrong), [palette]);
  const hot = useMemo(() => new THREE.Color(palette.accent), [palette]);
  const phase = node.pos[0] * 0.7 + node.pos[1];

  useEffect(() => () => label.dispose(), [label]);

  useFrame(({ clock }, dt) => {
    const h = state.hovered;
    const lit = h === node.id ? 1 : h && ARCH_EDGES.some((e) => touches(e, h) && touches(e, node.id)) ? 0.6 : 0;
    if (edgeMat.current) edgeMat.current.color.lerpColors(base, hot, lit);
    if (group.current) {
      const target = h === node.id ? 1.06 : 1;
      group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, target, 1 - Math.exp(-dt * 10)));
      group.current.position.y = node.pos[1] + Math.sin(clock.elapsedTime * 0.8 + phase) * 0.06;
    }
  });

  return (
    <group
      ref={group}
      position={node.pos}
      onPointerOver={(e) => {
        e.stopPropagation();
        state.hovered = node.id;
      }}
      onPointerOut={() => {
        if (state.hovered === node.id) state.hovered = null;
      }}
    >
      <mesh>
        <boxGeometry args={[NODE_W, NODE_H, 0.16]} />
        <meshBasicMaterial color={palette.surface} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial ref={edgeMat} color={base} />
      </lineSegments>
      <mesh position={[0, 0, 0.081]}>
        <planeGeometry args={[NODE_W * 0.96, (NODE_W * 0.96 * 200) / 512]} />
        <meshBasicMaterial map={label} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Wires + packets
// ---------------------------------------------------------------------------

function Wires({ palette }: { palette: Palette }) {
  const geometries = useMemo(
    () => CURVES.map((cp) => new THREE.BufferGeometry().setFromPoints(Array.from({ length: 48 }, (_, i) => new THREE.Vector3(...bezier(cp, i / 47))))),
    [],
  );
  const lines = useMemo(
    () => geometries.map((geo) => new THREE.Line(geo, new THREE.LineBasicMaterial({ color: palette.muted, transparent: true, opacity: 0.7 }))),
    [geometries, palette],
  );
  const muted = useMemo(() => new THREE.Color(palette.muted), [palette]);
  const accent = useMemo(() => new THREE.Color(palette.accent), [palette]);

  useFrame(() => {
    ARCH_EDGES.forEach((e, i) => {
      const m = lines[i].material as THREE.LineBasicMaterial;
      const on = touches(e, state.hovered);
      m.color.copy(on ? accent : muted);
      m.opacity = THREE.MathUtils.lerp(m.opacity, state.hovered ? (on ? 1 : 0.25) : 0.7, 0.15);
    });
  });

  return (
    <group>
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
      <Ports palette={palette} />
    </group>
  );
}

function Ports({ palette }: { palette: Palette }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const m = new THREE.Matrix4();
    CURVES.forEach((cp, i) => {
      ref.current!.setMatrixAt(i * 2, m.makeTranslation(...cp[0]));
      ref.current!.setMatrixAt(i * 2 + 1, m.makeTranslation(...cp[3]));
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, CURVES.length * 2]}>
      <sphereGeometry args={[0.05, 10, 8]} />
      <meshBasicMaterial color={palette.ink} />
    </instancedMesh>
  );
}

const REQ_PER_EDGE = 2;

function Packets({ palette }: { palette: Palette }) {
  const req = useRef<THREE.InstancedMesh>(null);
  const res = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const clocks = useRef(ARCH_EDGES.map((_, i) => (i * 0.37) % 1));

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    let ri = 0;
    ARCH_EDGES.forEach((e, i) => {
      const boost = touches(e, state.hovered) ? 2.6 : state.hovered ? 0.6 : 1;
      clocks.current[i] = (clocks.current[i] + d * 0.32 * boost) % 1;
      const t0 = clocks.current[i];
      // requests travel forward
      for (let p = 0; p < REQ_PER_EDGE; p++) {
        const t = (t0 + p / REQ_PER_EDGE) % 1;
        dummy.position.set(...bezier(CURVES[i], t));
        dummy.scale.setScalar(Math.max(Math.min(1, t * 10, (1 - t) * 10), 0.0001));
        dummy.updateMatrix();
        req.current!.setMatrixAt(ri++, dummy.matrix);
      }
      // one response travels back
      const back = 1 - ((t0 + 0.25) % 1);
      dummy.position.set(...bezier(CURVES[i], back));
      dummy.scale.setScalar(Math.max(Math.min(1, back * 10, (1 - back) * 10), 0.0001));
      dummy.updateMatrix();
      res.current!.setMatrixAt(i, dummy.matrix);
    });
    req.current!.instanceMatrix.needsUpdate = true;
    res.current!.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={req} args={[undefined, undefined, ARCH_EDGES.length * REQ_PER_EDGE]} frustumCulled={false}>
        <boxGeometry args={[0.13, 0.13, 0.13]} />
        <meshBasicMaterial color={palette.accent} />
      </instancedMesh>
      <instancedMesh ref={res} args={[undefined, undefined, ARCH_EDGES.length]} frustumCulled={false}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial color={palette.ink} />
      </instancedMesh>
    </>
  );
}

function Backdrop({ palette }: { palette: Palette }) {
  const grid = useMemo(() => {
    const g = new THREE.GridHelper(60, 60, palette.line, palette.line);
    const m = g.material as THREE.Material;
    m.transparent = true;
    m.opacity = 0.55;
    g.rotation.x = Math.PI / 2;
    g.position.z = -3;
    return g;
  }, [palette]);
  useEffect(() => () => grid.dispose(), [grid]);
  return <primitive object={grid} />;
}

// ---------------------------------------------------------------------------
// Camera + layout
// ---------------------------------------------------------------------------

const TILT = THREE.MathUtils.degToRad(6);
const XS = ARCH_NODES.map((n) => n.pos[0]);
const GRAPH_SPAN = Math.max(...XS) - Math.min(...XS) + NODE_W;
const GRAPH_CENTER = (Math.max(...XS) + Math.min(...XS)) / 2;

function Rig({ children }: { children: React.ReactNode }) {
  const { camera, size } = useThree();
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  const target = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, dt) => {
    const p = pointer.current;
    const k = 1 - Math.exp(-Math.min(dt, 0.05) * 4);
    p.sx += (p.x - p.sx) * k;
    p.sy += (p.y - p.sy) * k;

    // Fit the graph into the right ~40% of the viewport on wide screens so it never sits under the copy.
    const aspect = size.width / size.height;
    if (group.current) {
      const halfW = Math.tan(THREE.MathUtils.degToRad(20)) * 11.5 * aspect;
      const wide = aspect > 1.25;
      const scale = wide ? Math.min(0.8, (0.62 * halfW) / GRAPH_SPAN) : Math.min(0.8, (1.8 * halfW) / GRAPH_SPAN);
      group.current.scale.setScalar(scale);
      group.current.position.x = wide ? halfW * 0.5 - GRAPH_CENTER * scale : -GRAPH_CENTER * scale;
      group.current.position.y = wide ? 0.3 : 1.8;
    }

    const scroll = Math.min(1, window.scrollY / window.innerHeight);
    camera.position.set(0, 0.6 + scroll * 3, 11.5 + scroll * 6);
    target.set(0, scroll * 1.5, 0);
    camera.lookAt(target);
    camera.rotateY(-p.sx * TILT);
    camera.rotateX(p.sy * TILT);
  });

  return (
    <group ref={group} rotation={[0, -0.18, 0]}>
      {children}
    </group>
  );
}

export default function HeroScene({ active, palette }: { active: boolean; palette: Palette }) {
  useEffect(
    () => () => {
      state.hovered = null;
    },
    [],
  );
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      flat
      camera={{ position: [0, 0.6, 11.5], fov: 40, near: 0.1, far: 80 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      aria-hidden
    >
      <color attach="background" args={[palette.canvas]} />
      <fog attach="fog" args={[palette.canvas, 12, 26]} />
      <Backdrop palette={palette} />
      <Rig>
        {ARCH_NODES.map((n) => (
          <NodeCard key={n.id} node={n} palette={palette} />
        ))}
        <Wires palette={palette} />
        <Packets palette={palette} />
      </Rig>
    </Canvas>
  );
}
