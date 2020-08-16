import * as d3 from "d3";
import { ForceLink } from "d3";
import * as React from "react";
import { useEffect } from "react";

import "../styles/App.css";
import { Coordinate, D3Graph, D3Link, D3Node } from "../types";

import Labels from "./labels";
import Links from "./links";
import Nodes from "./nodes";

interface Props {
  width: number;
  height: number;
  graph: D3Graph;
}

export default function App({ width, height, graph }: Props) {
  const simulation = d3
    .forceSimulation<D3Node, D3Link>()
    .force(
      "link",
      d3.forceLink<D3Node, D3Link>().id((d) => d.id)
    )
    .force("charge", d3.forceManyBody().strength(-100))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .nodes(graph.nodes);

  simulation.force<ForceLink<D3Node, D3Link>>("link")?.links(graph.links);

  useEffect(() => {
    simulation.nodes(graph.nodes).on("tick", () => {
      d3.selectAll<Element, { source: Coordinate; target: Coordinate }>(".link")
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      d3.selectAll<Element, Coordinate>(".node")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);

      d3.selectAll<Element, Coordinate>(".label")
        .attr("x", (d) => d.x + 5)
        .attr("y", (d) => d.y + 5);
    });
  });

  return (
    <svg className="container" height={height} width={width}>
      <Links links={graph.links} />
      <Nodes nodes={graph.nodes} simulation={simulation} />
      <Labels nodes={graph.nodes} />
    </svg>
  );
}
