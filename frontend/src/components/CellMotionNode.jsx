import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function CellMotionNode({ position, phase }) {
  const meshRef = useRef();
  const materialRef = useRef();

  const baseScale = 1;
  const baseY = position[1];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phase;

    if (!meshRef.current || !materialRef.current) return;

    // 🔹 POPPING (faster & smaller)
    const scale = baseScale + Math.sin(t * 3) * 0.25;
    meshRef.current.scale.set(scale, scale, scale);

    // 🔹 FLOAT (micro)
    meshRef.current.position.y =
      baseY + Math.sin(t * 2) * 0.25;

    // 🔹 COLOR CYCLE (different palette)
    const hue = (t * 80) % 360;
    materialRef.current.color.setHSL(
      hue / 360,
      0.9,
      0.6
    );
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#fde68a"
        emissive="#000000"
      />
    </mesh>
  );
}
