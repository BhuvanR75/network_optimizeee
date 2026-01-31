import { Text } from "@react-three/drei";

export default function Switch({ position, label, type = "csr" }) {
  return (
    <group position={position}>
      <mesh>
        {type === "leaf" ? (
          <cylinderGeometry args={[0.9, 0.9, 0.6, 6]} />
        ) : (
          <cylinderGeometry args={[0.7, 0.7, 0.8, 16]} />
        )}
        <meshStandardMaterial
          color={type === "leaf" ? "#6366f1" : "#1e3a8a"}
        />
      </mesh>

      <Text position={[0, -1, 0]} fontSize={0.24} color="white">
        {label}
      </Text>
    </group>
  );
}
