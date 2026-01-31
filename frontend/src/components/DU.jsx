export default function DU({ position }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[2, 1.4, 2]} />
        <meshStandardMaterial
          color="#22c55e"
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}
