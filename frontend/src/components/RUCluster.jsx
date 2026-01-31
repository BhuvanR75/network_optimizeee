export default function RUCluster({ position, color }) {
  return (
    <group position={position}>
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[i * 0.6, 0, 0]}>
          <boxGeometry args={[0.35, 0.35, 0.35]} />
          <meshStandardMaterial
            color={color}
            roughness={0.6}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}
