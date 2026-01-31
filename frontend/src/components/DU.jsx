import { RoundedBox } from "@react-three/drei";

export default function DU({ position }) {
  return (
    <group position={position}>

      {/* Base glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 0]}>
        <circleGeometry args={[1.8, 64]} />
        <meshBasicMaterial
          color="#22c55e"
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>

      {/* DU body (server-style) */}
      <RoundedBox args={[2.6, 1.6, 2.6]} radius={0.15} smoothness={4}>
        <meshStandardMaterial
          color="#22c55e"
          roughness={0.35}
          metalness={0.2}
        />
      </RoundedBox>

      {/* Front label */}
      <mesh position={[0, 0, 1.31]}>
        <planeGeometry args={[1.4, 0.5]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>

      {/* Text */}
      <mesh position={[0, 0, 1.32]}>
        <planeGeometry args={[1.2, 0.4]} />
        <meshBasicMaterial
          color="#22c55e"
          transparent
          opacity={0.9}
        />
      </mesh>

    </group>
  );
}
