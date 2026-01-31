import { Text } from "@react-three/drei";

export default function RU({ position }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.4, 0.8, 8, 16]} />
        <meshStandardMaterial color="#7dd3fc" />
      </mesh>

      <Text position={[0, -1, 0]} fontSize={0.22} color="white">
        RU
      </Text>
    </group>
  );
}
