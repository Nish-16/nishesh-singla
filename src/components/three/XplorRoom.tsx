"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useTheme } from "@/components/ThemeProvider";

type Box = { p: [number, number, number]; s: [number, number, number]; c: string };

// A simple low-poly room, built from boxes the way XPLOR scenes are composed from objects.
const ROOM: Box[] = [
  // floor + walls
  { p: [0, -0.05, 0], s: [6, 0.1, 5], c: "#2a2420" },
  { p: [0, 1.4, -2.5], s: [6, 2.9, 0.1], c: "#d8d2c6" },
  { p: [-3, 1.4, 0], s: [0.1, 2.9, 5], c: "#cfc8bb" },
  // rug
  { p: [0.4, 0.01, 0.2], s: [3, 0.02, 2], c: "#1d4a40" },
  // sofa
  { p: [0.4, 0.25, -1.7], s: [2.6, 0.5, 0.9], c: "#c8783c" },
  { p: [0.4, 0.7, -2.1], s: [2.6, 0.5, 0.2], c: "#b36a33" },
  { p: [-0.95, 0.45, -1.7], s: [0.2, 0.5, 0.9], c: "#b36a33" },
  { p: [1.75, 0.45, -1.7], s: [0.2, 0.5, 0.9], c: "#b36a33" },
  // coffee table
  { p: [0.4, 0.38, 0.2], s: [1.4, 0.08, 0.8], c: "#6b4a33" },
  { p: [-0.2, 0.17, -0.1], s: [0.08, 0.34, 0.08], c: "#4a3324" },
  { p: [1.0, 0.17, -0.1], s: [0.08, 0.34, 0.08], c: "#4a3324" },
  { p: [-0.2, 0.17, 0.5], s: [0.08, 0.34, 0.08], c: "#4a3324" },
  { p: [1.0, 0.17, 0.5], s: [0.08, 0.34, 0.08], c: "#4a3324" },
  // shelf
  { p: [-2.7, 0.9, 1.2], s: [0.5, 1.8, 1.2], c: "#3a2e26" },
  { p: [-2.45, 1.2, 1.0], s: [0.1, 0.3, 0.2], c: "#c6f432" },
  // side table
  { p: [2.3, 0.3, -1.8], s: [0.6, 0.6, 0.6], c: "#e6ede9" },
];

export default function XplorRoom() {
  const { palette } = useTheme();
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ position: [7, 5.2, 7], fov: 40 }}
      gl={{ antialias: true }}
      aria-label="Interactive 3D room"
    >
      <color attach="background" args={[palette.surface]} />
      <hemisphereLight args={["#fff3e6", "#20302a", 1.1]} />
      <directionalLight position={[4, 6, 3]} intensity={1.6} />
      {ROOM.map((b, i) => (
        <mesh key={i} position={b.p}>
          <boxGeometry args={b.s} />
          <meshStandardMaterial color={b.c} flatShading roughness={0.8} />
        </mesh>
      ))}
      {/* lamp */}
      <mesh position={[2.3, 0.85, -1.8]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 6]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[2.3, 1.2, -1.8]}>
        <coneGeometry args={[0.28, 0.35, 6, 1, true]} />
        <meshStandardMaterial color="#f2d15c" emissive="#f2d15c" emissiveIntensity={0.6} flatShading side={2} />
      </mesh>
      <pointLight position={[2.3, 1.1, -1.8]} color="#ffd9a0" intensity={3} distance={4} />
      {/* plant */}
      <mesh position={[2.4, 0.2, 1.8]}>
        <cylinderGeometry args={[0.22, 0.17, 0.4, 7]} />
        <meshStandardMaterial color="#c8783c" flatShading />
      </mesh>
      <mesh position={[2.4, 0.75, 1.8]}>
        <icosahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial color="#2f7d5b" flatShading />
      </mesh>
      <OrbitControls
        makeDefault
        enableDamping
        enablePan={false}
        minDistance={4}
        maxDistance={12}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0.6, 0]}
      />
    </Canvas>
  );
}
