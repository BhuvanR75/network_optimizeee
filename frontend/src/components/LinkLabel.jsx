import { Text, Billboard } from "@react-three/drei";

export default function LinkLabel({ position, text }) {
  return (
    <Billboard follow>
      <Text
        position={position}
        fontSize={0.35}
        color="#7dd3fc"
        anchorX="center"
        anchorY="middle"
        depthWrite={false}
        depthTest={false}
      >
        {text}
      </Text>
    </Billboard>
  );
}

