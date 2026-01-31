import { Text, Edges } from "@react-three/drei";

export default function TopNode({ position, label }) {
  return (
    <group position={position}>

      {/* Main digital glass cube */}
      <mesh>
        <boxGeometry args={[1.8, 1.8, 1.8]} />
        <meshPhysicalMaterial
          color="#6ecbff"
          transparent
          opacity={0.35}
          transmission={0.9}
          roughness={0.08}
          metalness={0.25}
          emissive="#38bdf8"
          emissiveIntensity={0.35}
        />
      </mesh>

      {/* Glowing cube edges */}
      <Edges
        scale={1.002}
        threshold={15}
        color="#7dd3fc"
      />

      {/* Glowing link port (front face) */}
      <mesh position={[0, 0, 0.95]}>
        <ringGeometry args={[0.2, 0.32, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.9}
          toneMapped={false}
        />
      </mesh>

      {/* Soft inner glow plane (adds depth like your image) */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[1.6, 1.6]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.05}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, -1.6, 0]}
        fontSize={0.28}
        color="#7dd3fc"
      >
        {label}
      </Text>
    </group>
  );
}
