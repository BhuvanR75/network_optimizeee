export default function VerticalBeam({ height = 6, color = "#22c55e" }) {
  return (
    <mesh position={[0, height / 2, 0]}>
      <cylinderGeometry args={[0.18, 0.18, height, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.2}
        transparent
        opacity={0.35}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
