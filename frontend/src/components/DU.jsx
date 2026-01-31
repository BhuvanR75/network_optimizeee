import { Text } from "@react-three/drei";

export default function DU({ position }) {
  return (
    <group position={position}>
      {/* Main body */}
      <mesh>
        <boxGeometry args={[2.2, 1.4, 1]} />
        <meshStandardMaterial color="#34d399" />
      </mesh>

      {/* Top layer */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[1.8, 0.2, 0.8]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>

      <Text position={[0, -1.2, 0]} fontSize={0.28} color="white">
        DU
      </Text>
    </group>
  );
}
