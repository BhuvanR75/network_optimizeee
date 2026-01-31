import { Text } from "@react-three/drei";

export default function Switch({ position, label }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.4, 1.4, 1.4]} />
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.5}
          metalness={0.15}
        />
      </mesh>

      <Text position={[0, -1.2, 0]} fontSize={0.25} color="#7dd3fc">
        {label}
      </Text>
    </group>
  );
}
