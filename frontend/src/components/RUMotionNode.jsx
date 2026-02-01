import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

const labelStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: "600",
  textShadow: "0 0 6px rgba(0,0,0,0.9)",
  pointerEvents: "none"
};

export default function RUMotionNode({ position }) {
  const meshRef = useRef();
  const baseY = position[1];

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const t = clock.getElapsedTime();

    // 🔹 vertical oscillation
    meshRef.current.position.y = baseY + Math.sin(t * 1.2) * 0.25;

    // 🔹 gentle rotation
    meshRef.current.rotation.y = Math.sin(t * 0.6) * 0.3;

    // 🔹 subtle breathing scale
    const s = 1 + Math.sin(t * 1.5) * 0.05;
    meshRef.current.scale.set(s, s, s);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[2.4, 2.4, 2.4]} />
      <meshStandardMaterial color="#f97316" />

      <Html center>
        <div style={labelStyle}>RU</div>
      </Html>
    </mesh>
  );
}
