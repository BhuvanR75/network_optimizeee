import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function ShiningLink({
  start,
  end,
  color = "#7dd3fc"
}) {
  const glowRef = useRef();

  // Animate glow opacity (shimmer)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (glowRef.current) {
      glowRef.current.material.opacity =
        0.4 + Math.sin(t * 2) * 0.2;
    }
  });

  return (
    <>
      {/* Inner transparent cable */}
      <Line
        points={[start, end]}
        color={color}
        lineWidth={1}
        transparent
        opacity={0.35}
      />

      {/* Outer glowing shine */}
      <Line
        ref={glowRef}
        points={[start, end]}
        color={color}
        lineWidth={3}
        transparent
        opacity={0.6}
      />
    </>
  );
}
