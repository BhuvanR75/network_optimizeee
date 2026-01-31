import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Text } from "@react-three/drei";

export default function RUNode({ position, label }) {
  const ref = useRef();

  useFrame(() => {
    ref.current.rotation.y += 0.005;
  });

  return (
    <group position={position}>
      <mesh ref={ref}>
        <boxGeometry args={[1.4, 0.8, 0.6]} />
        <meshStandardMaterial color="#60a5fa" />
      </mesh>
      <Text position={[0, -0.7, 0]} fontSize={0.25} color="white">
        {label}
      </Text>
    </group>
  );
}
