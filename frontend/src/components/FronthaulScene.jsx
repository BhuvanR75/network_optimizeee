import RUNode from "./RUNode";
import SwitchNode from "./SwitchNode";
import DUNodes from "./DUNodes";
import LinkLine from "./LinkLine";

export default function FronthaulScene() {
  return (
    <>
      {/* Upper RUs */}
      <RUNode position={[-6, 2, 0]} label="RU-1" />
      <RUNode position={[-3, 2, 0]} label="RU-2" />
      <RUNode position={[0, 2, 0]} label="RU-3" />

      {/* Lower RUs */}
      <RUNode position={[-6, -2, 0]} label="RU-4" />
      <RUNode position={[-3, -2, 0]} label="RU-5" />
      <RUNode position={[0, -2, 0]} label="RU-6" />

      {/* CSR Switches */}
      <SwitchNode position={[-2, 0, 0]} label="CSR-1" />
      <SwitchNode position={[-2, -1.5, 0]} label="CSR-2" />

      {/* Leaf Switch */}
      <SwitchNode position={[3, 0, 0]} label="Leaf Switch" />

      {/* DU */}
      <DUNodes position={[6, 0, 0]} />

      {/* Links */}
      <LinkLine start={[-2, 0, 0]} end={[3, 0, 0]} label="Link 2" />
      <LinkLine start={[-2, -1.5, 0]} end={[3, 0, 0]} label="Link 3" />
      <LinkLine start={[3, 0, 0]} end={[6, 0, 0]} label="Link 1" />
    </>
  );
}
