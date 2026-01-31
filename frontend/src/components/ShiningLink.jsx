import * as THREE from "three";

export default function ShiningLink({
  start,
  end,
  color = "#00eaff",
  radius = 0.12
}) {
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);

  const mid = startVec.clone().lerp(endVec, 0.5);
  const length = startVec.distanceTo(endVec);

  const direction = new THREE.Vector3()
    .subVectors(endVec, startVec)
    .normalize();

  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction
  );

  return (
    <mesh position={mid} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, length, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={3}
        transparent={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
