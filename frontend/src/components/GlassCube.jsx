export default function GlassCube() {
  return (
    <mesh>
      <boxGeometry args={[18, 12, 18]} />
      <meshPhysicalMaterial
        transmission={1}
        thickness={1}
        roughness={0}
        metalness={0}
        opacity={0.08}
        transparent
        color="#7dd3fc"
      />
    </mesh>
  );
}
