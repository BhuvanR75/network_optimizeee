import { Line } from "@react-three/drei";

export default function LinkLine({ start, end }) {
  return (
    <Line
      points={[start, end]}
      color="white"
      lineWidth={1}
      dashed
      dashSize={0.3}
      gapSize={0.2}
    />
  );
}
