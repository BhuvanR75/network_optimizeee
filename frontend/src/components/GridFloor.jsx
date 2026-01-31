import { Grid } from "@react-three/drei";

export default function GridFloor() {
  return (
    <Grid
      args={[18, 18]}
      cellSize={0.6}
      cellThickness={0.6}
      cellColor="#0ea5e9"
      sectionSize={3}
      sectionThickness={1.2}
      sectionColor="#38bdf8"
      fadeDistance={25}
    />
  );
}
