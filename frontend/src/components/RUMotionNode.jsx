import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function RUMotionNode({ position }) {
  const meshRef = useRef();
  const materialRef = useRef();

  const baseScale = 1;
  const baseY = position[1];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (!meshRef.current || !materialRef.current) return;

    // 🔹 POPPING (scale)
    const scale = baseScale + Math.sin(t * 1.5) * 0.15;
    meshRef.current.scale.set(scale, scale, scale);

    // 🔹 FLOAT (slight)
    meshRef.current.position.y =
      baseY + Math.sin(t) * 0.4;

    // 🔹 COLOR PULSE
    const hue = (t * 40) % 360;
    materialRef.current.color.setHSL(
      hue / 360,
      0.7,
      0.55
    );
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[2.4, 2.4, 2.4]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#f97316"
        emissive="#000000"
      />
    </mesh>
  );
}
