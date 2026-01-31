import RU from "./RU";
import Switch from "./Switch";
import DU from "./DU";
import LinkCylinder from "./LinkCylinder";

export default function Scene() {
  const radiusRU = 6;
  const radiusCSR = 3;

  return (
    <group position={[0, 0, 0]}>
      
      {/* Leaf Switch (CENTER) */}
      <Switch position={[0, 0, 0]} label="Leaf" />

      {/* DU (RIGHT) */}
      <DU position={[4, 0, 0]} />
      <LinkCylinder start={[0, 0, 0]} end={[4, 0, 0]} />

      {/* Upper CSR */}
      <Switch position={[-2, 2, 0]} label="CSR" />
      <LinkCylinder start={[-2, 2, 0]} end={[0, 0, 0]} />

      {/* Lower CSR */}
      <Switch position={[-2, -2, 0]} label="CSR" />
      <LinkCylinder start={[-2, -2, 0]} end={[0, 0, 0]} />

      {/* Upper RUs (CIRCULAR ARC) */}
      <RU position={[-4.5, 3, 0]} />
      <RU position={[-6, 2, 0]} />
      <RU position={[-4.5, 1, 0]} />

      <LinkCylinder start={[-4.5, 3, 0]} end={[-2, 2, 0]} />
      <LinkCylinder start={[-6, 2, 0]} end={[-2, 2, 0]} />
      <LinkCylinder start={[-4.5, 1, 0]} end={[-2, 2, 0]} />

      {/* Lower RUs (CIRCULAR ARC) */}
      <RU position={[-4.5, -1, 0]} />
      <RU position={[-6, -2, 0]} />
      <RU position={[-4.5, -3, 0]} />

      <LinkCylinder start={[-4.5, -1, 0]} end={[-2, -2, 0]} />
      <LinkCylinder start={[-6, -2, 0]} end={[-2, -2, 0]} />
      <LinkCylinder start={[-4.5, -3, 0]} end={[-2, -2, 0]} />
    </group>
  );
}
