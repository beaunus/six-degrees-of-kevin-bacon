import React from "react";

import { generateRandomGraph } from "../../../lib/src/graph";

import "../styles/App.css";
import Graph from "./Graph";

export default function App() {
  const { links, nodes } = generateRandomGraph();

  return (
    <Graph
      height={window.screen.height}
      links={links}
      nodes={nodes}
      width={window.screen.width}
    />
  );
}
