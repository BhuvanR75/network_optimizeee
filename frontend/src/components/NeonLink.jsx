import * as THREE from "three";

export default function NeonLink({ start, end, color }) {
  const s = new THREE.Vector3(...start);
  const e = new THREE.Vector3(...end);
  const mid = s.clone().lerp(e, 0.5);
  const length = s.distanceTo(e);

  const dir = new THREE.Vector3().subVectors(e, s).normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir
  );

  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[0.06, 0.06, length, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
      />
    </mesh>
  );
}
