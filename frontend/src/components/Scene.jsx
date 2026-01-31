import { useEffect, useState } from "react";
import DynamicScene from "./DynamicScene";

export default function Scene() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/topology.json")
      .then((res) => res.json())
      .then((json) => {
        console.log("Fetched topology:", json);
        setData(json);
      })
      .catch((err) => {
        console.error("Failed to load topology.json", err);
      });
  }, []);

  if (!data) {
    console.log("Waiting for topology data...");
    return null;
  }

  return (
    <group>
      <DynamicScene data={data} />
    </group>
  );
}
