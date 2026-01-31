import { Text } from "@react-three/drei";

export default function SwitchNode({ position, label }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
      <Text position={[0, -0.9, 0]} fontSize={0.25} color="white">
        {label}
      </Text>
    </group>
  );
}
