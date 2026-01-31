export default function DUNodes({ position }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.8, 1.2, 0.8]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
    </group>
  );
}
