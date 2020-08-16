import * as d3 from "d3";
import React, { useRef, useEffect } from "react";

import { D3Node } from "../types";

const Label: React.FC<{ node: D3Node }> = ({ node }) => {
  let thisRef = useRef<SVGTextElement>(null);

  useEffect(() => {
    d3.select(thisRef).data([node]);
  });

  return (
    <text className="label" ref={(ref) => (thisRef = ref)}>
      {node.id}
    </text>
  );
};

const Labels: React.FC<{ nodes: D3Node[] }> = ({ nodes }) => (
  <g className="labels">
    {nodes.map((node, index) => (
      <Label key={index} node={node} />
    ))}
  </g>
);

export default Labels;
