import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Scene from "./components/Scene";
import FirstStage from "./components/1st";
import Dashboard from "./components/2ndstage";

/* ================= NAVBAR ================= */
const Navbar = ({ onUpload }) => {
  return (
    <div
      style={{
        height: "64px",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        boxSizing: "border-box",
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.7), rgba(0,0,0,0.95))",
        borderBottom: "1px solid rgba(255,255,255,0.15)",
        backdropFilter: "blur(8px)",
        zIndex: 10
      }}
    >
      {/* Left: Brand */}
      <div
        style={{
          fontSize: "20px",
          fontWeight: "700",
          color: "#f9fafb",
          letterSpacing: "0.5px"
        }}
      >
        NetSense
      </div>

      {/* Right: Upload Button */}
      <label
        style={{
          padding: "10px 18px",
          borderRadius: "8px",
          cursor: "pointer",
          background:
            "linear-gradient(180deg, #3b82f6, #2563eb)",
          border: "1px solid #60a5fa",
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: "600",
          boxShadow: "0 4px 14px rgba(37,99,235,0.6)",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.transform = "scale(1.05)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.transform = "scale(1)")
        }
      >
        Upload ZIP
        <input
          type="file"
          accept=".zip"
          hidden
          onChange={onUpload}
        />
      </label>
    </div>
  );
};

/* ================= HOME ================= */
const Home = () => {
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("ZIP uploaded:", file.name);
    // ZIP parsing logic can be added here
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at center, #482426 0%, #602726 35%, #552121 60%, #712d2d 100%)"
      }}
    >
      {/* Background overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.2) 100%)",
          pointerEvents: "none"
        }}
      />

      {/* Navbar */}
      <Navbar onUpload={handleUpload} />

      {/* 3D Simulation */}
      <div
        style={{
          width: "100%",
          height: "calc(100% - 64px)"
        }}
      >
        <Canvas
          camera={{ position: [0, 7, 14], fov: 45 }}
          style={{ position: "relative", zIndex: 1 }}
        >
          <ambientLight intensity={0.95} />
          <directionalLight
            position={[6, 10, 6]}
            intensity={1.5}
          />
          <directionalLight
            position={[-6, -6, -6]}
            intensity={0.3}
          />

          <Scene />

          <OrbitControls enableZoom enablePan={false} />
        </Canvas>
      </div>
    </div>
  );
};

/* ================= ROUTES ================= */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/1" element={<FirstStage />} />
        <Route path="/2" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
