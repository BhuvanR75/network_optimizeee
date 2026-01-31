import { RoundedBox } from "@react-three/drei";

export default function RUCluster({
  position,
  color,
  cells = []   // ✅ DEFAULT VALUE
}) {
  return (
    <group position={position}>
      {cells.map((cell, i) => {
        const x = (i % 2) * 0.7;
        const z = Math.floor(i / 2) * 0.7;

        return (
          <RoundedBox
            key={cell}
            args={[0.4, 0.4, 0.4]}
            position={[x, 0, z]}
            radius={0.06}
            smoothness={4}
          >
            <meshStandardMaterial
              color={color}
              roughness={0.4}
              metalness={0.15}
            />
          </RoundedBox>
        );
      })}
    </group>
  );
}
