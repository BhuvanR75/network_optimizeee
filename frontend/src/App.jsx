import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Scene from "./components/Scene";

export default function App() {
  return (
    <Canvas camera={{ position: [0, 12, 30], fov: 50 }}>
      {/* Lights */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 15, 10]} intensity={1} />

      {/* Main Scene */}
      <Scene />

      {/* Camera controls */}
      <OrbitControls />
    </Canvas>
  );
}
