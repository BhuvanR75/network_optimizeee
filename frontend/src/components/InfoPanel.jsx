import { Html } from "@react-three/drei";

export default function InfoPanel({ position, text }) {
  return (
    <Html position={position} transform>
      <div style={{
        background: "rgba(15,23,42,0.75)",
        border: "1px solid #38bdf8",
        padding: "8px 12px",
        borderRadius: "6px",
        color: "#7dd3fc",
        fontSize: "12px",
        backdropFilter: "blur(8px)"
      }}>
        {text}
      </div>
    </Html>
  );
}
