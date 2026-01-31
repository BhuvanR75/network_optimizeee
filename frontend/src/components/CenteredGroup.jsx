import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";

export default function CenteredGroup({ children, yOffset = -1.5, ...props }) {
  const ref = useRef();

  useLayoutEffect(() => {
    if (!ref.current) return;

    const box = new THREE.Box3().setFromObject(ref.current);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Center exactly
    ref.current.position.sub(center);

    // Move DOWN slightly (visual centering)
    ref.current.position.y += yOffset;
  }, [yOffset]);

  return (
    <group ref={ref} {...props}>
      {children}
    </group>
  );
}
