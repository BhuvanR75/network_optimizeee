import * as THREE from "three";

export default function LinkCylinder({ start, end }) {
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const mid = startVec.clone().lerp(endVec, 0.5);
  const length = startVec.distanceTo(endVec);

  const direction = new THREE.Vector3()
    .subVectors(endVec, startVec)
    .normalize();

  const axis = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction);

  return (
    <mesh position={mid} quaternion={quaternion}>
      <cylinderGeometry args={[0.05, 0.05, length, 16]} />
      <meshStandardMaterial color="#e5e7eb" />
    </mesh>
  );
}
