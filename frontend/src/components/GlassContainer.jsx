import { Edges } from "@react-three/drei";

export default function GlassContainer() {
  return (
    <group position={[0, 4, 0]}>
      {/* Transparent box */}
      <mesh>
        <boxGeometry args={[26, 16, 26]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.05}
          transmission={1}
          roughness={0}
          metalness={0}
          thickness={1}
          color="#7dd3fc"
        />
      </mesh>

      {/* Box edges */}
      <Edges
        scale={1.001}
        threshold={15}
        color="#60a5fa"
      />
    </group>
  );
}
