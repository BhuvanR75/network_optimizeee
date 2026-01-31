import CenteredGroup from "./CenteredGroup";
import GlassContainer from "./GlassContainer";
import GridFloor from "./GridFloor";
import DU from "./DU";
import Switch from "./Switch";
import RUCluster from "./RUCluster";
import InfoPanel from "./InfoPanel";
import ShiningLink from "./ShiningLink";

export default function Scene() {
  return (
    <CenteredGroup scale={1.2} yOffset={-3.5}>

      {/* ============================= */}
      {/* SINGLE TRANSPARENT GLASS BOX */}
      {/* ============================= */}
      <GlassContainer />

      {/* ============================= */}
      {/* GRID FLOOR */}
      {/* ============================= */}
      <GridFloor />

      {/* ============================= */}
      {/* DU (BOTTOM CENTER) */}
      {/* ============================= */}
      <DU position={[0, 0, 0]} />

      {/* ============================= */}
      {/* SHINING LINKS (ONLY THESE GLOW) */}
      {/* ============================= */}

      {/* DU → Top Hub */}
      <ShiningLink
        start={[0, 1.2, 0]}
        end={[0, 7, 0]}
        color="#22c55e"
      />

      {/* ============================= */}
      {/* TOP HUB SWITCH */}
      {/* ============================= */}
      <Switch position={[0, 7, 0]} label="Link 1 | Link 3" />

      {/* ============================= */}
      {/* L-SHAPE LEFT BRANCH (X AXIS) */}
      {/* ============================= */}
      <ShiningLink
        start={[0, 7, 0]}
        end={[-7, 7, 0]}
        color="#38bdf8"
      />

      <Switch position={[-7, 7, 0]} label="CSR" />

      <RUCluster
        position={[-7, 4, -2]}
        color="#22c55e"
      />

      {/* ============================= */}
      {/* L-SHAPE FRONT BRANCH (Z AXIS) */}
      {/* ============================= */}
      <ShiningLink
        start={[0, 7, 0]}
        end={[0, 7, -7]}
        color="#38bdf8"
      />

      <Switch position={[0, 7, -7]} label="CSR" />

      <RUCluster
        position={[2, 4, -7]}
        color="#ef4444"
      />

      {/* ============================= */}
      {/* INFO / HUD PANELS */}
      {/* ============================= */}
      <InfoPanel
        position={[-4.5, 10, 0]}
        text="Fronthaul Network Topology Analysis"
      />

      <InfoPanel
        position={[4.5, 10, -2]}
        text="Link Utilization: 75%"
      />

      <InfoPanel
        position={[-8, 5, -2]}
        text="RU Cluster A\nTraffic: Normal"
      />

      <InfoPanel
        position={[3, 5, -9]}
        text="RU Cluster B\nCongestion Detected"
      />

    </CenteredGroup>
  );
}
