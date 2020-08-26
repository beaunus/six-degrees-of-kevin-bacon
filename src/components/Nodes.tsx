import * as d3 from "d3";
import { Simulation } from "d3";
import React, { useEffect, useRef } from "react";

import { D3Link, D3Node } from "../types";

const NODE_RADIUS = 10;

const Node: React.FC<{ node: D3Node; color: string }> = ({ node, color }) => {
  let thisRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    d3.select(thisRef).data([node]);
  });

  return (
    <circle
      className="node"
      fill={color}
      r={NODE_RADIUS}
      ref={(ref) => (thisRef = ref)}
    >
      <title>{node.id}</title>
    </circle>
  );
};

const Nodes: React.FC<{
  nodes: Array<D3Node>;
  simulation: Simulation<D3Node, D3Link>;
}> = ({ nodes, simulation }) => {
  useEffect(() => {
    d3.selectAll<Element, D3Node>(".node").call(
      /* eslint-disable no-param-reassign */
      d3
        .drag<Element, D3Node>()
        .on("start", (d) => {
          if (!d3.event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (d) => {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        })
        .on("end", (d) => {
          if (!d3.event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      /* eslint-enable no-param-reassign */
    );
  });

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  return (
    <g className="nodes">
      {nodes.map((node, index) => (
        <Node color={color(node.group.toString())} key={index} node={node} />
      ))}
    </g>
  );
};

export default Nodes;
