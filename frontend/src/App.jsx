import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Scene from "./components/Scene";

export default function App() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background: `
          radial-gradient(
            circle at center,
            #482426 0%,
            #602726 35%,
            #552121 60%,
            #712d2d 100%
          )
        `
      }}
    >
      {/* subtle vignette for elegance */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.15) 100%)",
          pointerEvents: "none"
        }}
      />

      <Canvas
        camera={{ position: [0, 7, 14], fov: 45 }}
        style={{ position: "relative", zIndex: 1 }}
      >
        {/* soft elegant lighting */}
        <ambientLight intensity={0.95} />
        <directionalLight position={[6, 10, 6]} intensity={1.5} />
        <directionalLight position={[-6, -6, -6]} intensity={0.3} />

        <Scene />
        <OrbitControls enableZoom enablePan={false} />
      </Canvas>
    </div>
  );
}
