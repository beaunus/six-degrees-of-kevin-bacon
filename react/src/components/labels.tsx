import * as d3 from "d3";
import React, { useRef, useEffect } from "react";

import { D3Node } from "../types";

function Label({ node }: { node: D3Node }) {
  let thisRef = useRef<SVGTextElement>(null);

  useEffect(() => {
    d3.select(thisRef).data([node]);
  });

  return (
    <text className="label" ref={(ref) => (thisRef = ref)}>
      {node.id}
    </text>
  );
}

export default function Labels({ nodes }: { nodes: D3Node[] }) {
  return (
    <g className="labels">
      {nodes.map((node, index) => (
        <Label key={index} node={node} />
      ))}
    </g>
  );
}
