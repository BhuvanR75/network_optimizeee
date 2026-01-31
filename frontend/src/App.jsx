import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import Scene from "./components/Scene";

export default function App() {
  return (
    <Canvas
      camera={{ position: [14, 16, 18], fov: 40 }}
      gl={{ antialias: true }}
    >
      {/* Background */}
      <color attach="background" args={["#050814"]} />

      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1.6} />
      <pointLight position={[0, 10, 0]} intensity={1.5} color="#38bdf8" />

      {/* Scene */}
      <Scene />

      {/* Bloom → ONLY links glow */}
      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0}
          luminanceSmoothing={0.9}
        />
      </EffectComposer>

      {/* Controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.2}
      />
    </Canvas>
  );
}
