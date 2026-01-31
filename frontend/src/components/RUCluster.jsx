import { RoundedBox } from "@react-three/drei";

export default function RUCluster({ position, color }) {
  const cubes = [];

  for (let x = 0; x < 3; x++) {
    for (let z = 0; z < 2; z++) {
      cubes.push(
        <group
          key={`${x}-${z}`}
          position={[x * 0.7, 0, z * 0.7]}
        >
          {/* Glow */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]}>
            <circleGeometry args={[0.35, 32]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.4}
              depthWrite={false}
            />
          </mesh>

          {/* RU cube */}
          <RoundedBox args={[0.4, 0.4, 0.4]} radius={0.06} smoothness={4}>
            <meshStandardMaterial
              color={color}
              roughness={0.4}
              metalness={0.15}
            />
          </RoundedBox>
        </group>
      );
    }
  }

  return <group position={position}>{cubes}</group>;
}
