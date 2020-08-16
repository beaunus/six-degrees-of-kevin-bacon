import React from "react";

import { links, nodes } from "../miserables.json";

import "../styles/App.css";
import Graph from "./Graph";

export default function App() {
  return (
    <Graph
      height={window.screen.height}
      links={links}
      nodes={nodes}
      width={window.screen.width}
    />
  );
}
