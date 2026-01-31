import { Text, Edges, Billboard } from "@react-three/drei";

export default function TopNode({ position, label }) {
  return (
    <Billboard
      position={position}
      follow={true}
      lockX={false}
      lockY={false}
      lockZ={false}
    >
      <group renderOrder={10}>

        {/* Digital translucent cube */}
        <mesh renderOrder={10}>
          <boxGeometry args={[1.8, 1.8, 1.8]} />
          <meshPhysicalMaterial
            color="#6ecbff"
            transparent
            opacity={0.35}
            transmission={0.9}
            roughness={0.08}
            metalness={0.25}
            emissive="#38bdf8"
            emissiveIntensity={0.4}
            depthWrite={false}
            depthTest={false}
          />
        </mesh>

        {/* Glowing cube edges */}
        <Edges
          scale={1.002}
          threshold={15}
          color="#7dd3fc"
          renderOrder={11}
        />

        {/* Glowing link port */}
        <mesh position={[0, 0, 0.95]} renderOrder={12}>
          <ringGeometry args={[0.2, 0.32, 32]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.9}
            toneMapped={false}
            depthWrite={false}
            depthTest={false}
          />
        </mesh>

        {/* Content label on cube */}
        <Text
          position={[0, -1.6, 0]}
          fontSize={0.28}
          color="#7dd3fc"
          renderOrder={13}
        >
          {label}
        </Text>

      </group>
    </Billboard>
  );
}
