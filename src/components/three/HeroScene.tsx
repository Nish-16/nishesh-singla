"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { ARCH_EDGES, ARCH_NODES, NODE_H, NODE_W, bezier, edgeControlPoints, type ArchNode, type ArchNodeId } from "@/lib/arch";

const BG = "#0A0F0D";
const SIGNAL = "#3DF5C4";
const WARM = "#F0B35A";
const MUTED = "#8A9A93";

/** Shared, mutable scene state kept out of React (only one hero scene exists). */
const state = { hovered: null as ArchNodeId | null };

const touches = (edge: [ArchNodeId, ArchNodeId], id: ArchNodeId | null) => !!id && (edge[0] === id || edge[1] === id);

// ---------------------------------------------------------------------------
// Node card label (canvas texture, no font network requests)
// ---------------------------------------------------------------------------

function makeLabelTexture(node: ArchNode): THREE.CanvasTexture {
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
    g.fillStyle = SIGNAL;
    g.beginPath();
    g.arc(44, 74, 11, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#E6EDE9";
    g.font = `700 60px ${mono}`;
    g.textBaseline = "middle";
    g.fillText(node.label, 74, 76);
    g.fillStyle = MUTED;
    g.font = `500 32px ${mono}`;
    g.fillText(node.sub, 34, 142);
    tex.needsUpdate = true;
  };
  draw();
  document.fonts?.ready.then(draw);
  return tex;
}

function NodeCard({ node }: { node: ArchNode }) {
  const label = useMemo(() => makeLabelTexture(node), [node]);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(NODE_W, NODE_H, 0.16)), []);
  const edgeMat = useRef<THREE.LineBasicMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const base = useMemo(() => new THREE.Color(SIGNAL).multiplyScalar(0.55), []);
  const hot = useMemo(() => new THREE.Color(SIGNAL).multiplyScalar(2.6), []);
  const phase = node.pos[0] * 0.7 + node.pos[1];

  useFrame(({ clock }, dt) => {
    const h = state.hovered;
    const lit = h === node.id ? 1 : h && ARCH_EDGES.some((e) => touches(e, h) && touches(e, node.id)) ? 0.55 : 0;
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
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        if (state.hovered === node.id) state.hovered = null;
        document.body.style.cursor = "";
      }}
    >
      <mesh>
        <boxGeometry args={[NODE_W, NODE_H, 0.16]} />
        <meshStandardMaterial color="#111916" roughness={0.55} metalness={0.2} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial ref={edgeMat} color={base} toneMapped={false} />
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

const CURVES = ARCH_EDGES.map(([a, b]) => edgeControlPoints(a, b));

function Wires() {
  const lines = useMemo(
    () =>
      CURVES.map((cp) => {
        const geo = new THREE.BufferGeometry().setFromPoints(Array.from({ length: 48 }, (_, i) => new THREE.Vector3(...bezier(cp, i / 47))));
        const mat = new THREE.LineBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.4, toneMapped: false });
        return new THREE.Line(geo, mat);
      }),
    [],
  );

  useFrame(() => {
    ARCH_EDGES.forEach((e, i) => {
      const m = lines[i].material as THREE.LineBasicMaterial;
      const target = state.hovered ? (touches(e, state.hovered) ? 0.95 : 0.12) : 0.4;
      m.opacity = THREE.MathUtils.lerp(m.opacity, target, 0.15);
    });
  });

  return (
    <group>
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
      <Ports />
    </group>
  );
}

function Ports() {
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
      <sphereGeometry args={[0.055, 10, 8]} />
      <meshBasicMaterial color={new THREE.Color(SIGNAL).multiplyScalar(1.4)} toneMapped={false} />
    </instancedMesh>
  );
}

const REQ_PER_EDGE = 2;
const TAIL = 3;

function Packets() {
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
      // requests travel forward with a short tail
      for (let p = 0; p < REQ_PER_EDGE; p++) {
        const head = (t0 + p / REQ_PER_EDGE) % 1;
        for (let k = 0; k < TAIL; k++) {
          const t = head - k * 0.025;
          const s = t < 0 ? 0 : Math.min(1, t * 10, (1 - t) * 10) * (1 - k / TAIL);
          dummy.position.set(...bezier(CURVES[i], Math.max(0, t)));
          dummy.scale.setScalar(Math.max(s, 0.0001));
          dummy.updateMatrix();
          req.current!.setMatrixAt(ri++, dummy.matrix);
        }
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
      <instancedMesh ref={req} args={[undefined, undefined, ARCH_EDGES.length * REQ_PER_EDGE * TAIL]} frustumCulled={false}>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshBasicMaterial color={new THREE.Color(SIGNAL).multiplyScalar(3)} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={res} args={[undefined, undefined, ARCH_EDGES.length]} frustumCulled={false}>
        <sphereGeometry args={[0.06, 10, 8]} />
        <meshBasicMaterial color={new THREE.Color(WARM).multiplyScalar(2.4)} toneMapped={false} />
      </instancedMesh>
    </>
  );
}

function Backdrop() {
  const grid = useMemo(() => {
    const g = new THREE.GridHelper(60, 60, SIGNAL, SIGNAL);
    const m = g.material as THREE.Material;
    m.transparent = true;
    m.opacity = 0.05;
    g.rotation.x = Math.PI / 2;
    g.position.z = -3;
    return g;
  }, []);
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

export default function HeroScene({ active }: { active: boolean }) {
  useEffect(
    () => () => {
      state.hovered = null;
      document.body.style.cursor = "";
    },
    [],
  );
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0.6, 11.5], fov: 40, near: 0.1, far: 80 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      aria-hidden
    >
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 12, 26]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 8]} intensity={1} />
      <Backdrop />
      <Rig>
        {ARCH_NODES.map((n) => (
          <NodeCard key={n.id} node={n} />
        ))}
        <Wires />
        <Packets />
      </Rig>
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.8} luminanceThreshold={0.85} luminanceSmoothing={0.2} />
      </EffectComposer>
    </Canvas>
  );
}
