import { Vector3 } from "three";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import ShiningLink from "./ShiningLink";
import RUMotionNode from "./RUMotionNode";
import CellMotionNode from "./CellMotionNode";

export default function DynamicScene({ data }) {
  if (!data || !data.DU) return null;

  const csrEntries = Object.entries(data.DU);

  // Tree levels
  const DU_Y = 16;
  const LEAF_SW_Y = 12;
  const CSR_Y = 8;
  const LEAF_Y = 4;

  // Center whole diagram
  const ROOT_OFFSET = [0, -10, 2];

  // Smooth convergence animation for links
  const progress = useRef(0);

  useEffect(() => {
    progress.current = 0;
  }, [data]);

  useFrame((_, delta) => {
    if (progress.current < 1) {
      progress.current += delta * 0.6;
      if (progress.current > 1) progress.current = 1;
    }
  });

  // Interpolate link start → end
  const lerpPoint = (from, to) =>
    new Vector3(...from).lerp(
      new Vector3(...to),
      progress.current
    );

  return (
    <group position={ROOT_OFFSET}>
      {/* ================= DU ================= */}
      <mesh position={[0, DU_Y, 0]}>
        <boxGeometry args={[4, 2, 4]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>

      {/* ============ Leaf Switch ============ */}
      <mesh position={[0, LEAF_SW_Y, 0]}>
        <boxGeometry args={[5, 2, 3]} />
        <meshStandardMaterial color="#16a34a" />
      </mesh>

      {/* DU → Leaf Switch */}
      <ShiningLink
        start={lerpPoint([0, DU_Y - 1, 0], [0, DU_Y - 1, 0]).toArray()}
        end={lerpPoint([0, LEAF_SW_Y + 1, 0], [0, LEAF_SW_Y + 1, 0]).toArray()}
        color="#22c55e"
      />

      {csrEntries.map(([csrName, leafLinks], csrIndex) => {
        const csrX =
          (csrIndex - (csrEntries.length - 1) / 2) * 14;

        return (
          <group key={csrName}>
            {/* Leaf Switch → CSR */}
            <ShiningLink
              start={lerpPoint([0, LEAF_SW_Y - 1, 0], [0, LEAF_SW_Y - 1, 0]).toArray()}
              end={lerpPoint([csrX, CSR_Y + 1, 0], [csrX, CSR_Y + 1, 0]).toArray()}
              color="#7dd3fc"
            />

            {/* CSR Node */}
            <mesh position={[csrX, CSR_Y, 0]}>
              <boxGeometry args={[3, 2, 3]} />
              <meshStandardMaterial color="#38bdf8" />
            </mesh>

            {Object.entries(leafLinks).map(
              ([leafName, leafData], leafIndex) => {
                const leafX =
                  csrX +
                  (leafIndex -
                    (Object.keys(leafLinks).length - 1) / 2) *
                    5;
                const leafZ = -6;

                return (
                  <group key={leafName}>
                    {/* CSR → RU */}
                    <ShiningLink
                      start={lerpPoint([csrX, CSR_Y - 1, 0], [csrX, CSR_Y - 1, 0]).toArray()}
                      end={lerpPoint([leafX, LEAF_Y + 1, leafZ], [leafX, LEAF_Y + 1, leafZ]).toArray()}
                      color="#facc15"
                    />

                    {/* RU (with motion) */}
                    <RUMotionNode
                      position={[leafX, LEAF_Y, leafZ]}
                    />

                    {/* Cells (with motion) */}
                    {leafData.cells.map((cell, i) => {
                      const cols = Math.ceil(
                        Math.sqrt(leafData.cells.length)
                      );
                      const x = (i % cols) * 0.6 - 0.6;
                      const z =
                        Math.floor(i / cols) * 0.6 - 0.6;

                      return (
                        <CellMotionNode
                          key={cell}
                          position={[
                            leafX + x,
                            LEAF_Y - 2.4,
                            leafZ + z
                          ]}
                          phase={i}
                        />
                      );
                    })}
                  </group>
                );
              }
            )}
          </group>
        );
      })}
    </group>
  );
}
