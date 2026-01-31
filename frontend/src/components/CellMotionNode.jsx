import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function CellMotionNode({ position, phase = 0 }) {
  const meshRef = useRef();

  const baseX = position[0];
  const baseY = position[1];
  const baseZ = position[2];

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const t = clock.getElapsedTime() + phase;

    // 🔹 small orbital motion
    meshRef.current.position.x = baseX + Math.sin(t * 2) * 0.15;
    meshRef.current.position.z = baseZ + Math.cos(t * 2) * 0.15;

    // 🔹 slight vertical bob
    meshRef.current.position.y = baseY + Math.sin(t * 3) * 0.12;

    // 🔹 pulse
    const s = 1 + Math.sin(t * 4) * 0.2;
    meshRef.current.scale.set(s, s, s);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshStandardMaterial color="#fde68a" />
    </mesh>
  );
}
