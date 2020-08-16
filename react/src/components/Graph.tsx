import * as d3 from "d3";
import { ForceLink } from "d3";
import React, { useEffect } from "react";

import { D3Link, D3Node, Coordinate } from "../types";

import Labels from "./Labels";
import Links from "./Links";
import Nodes from "./Nodes";

interface Props {
  width: number;
  height: number;
  links: Array<D3Link>;
  nodes: Array<D3Node>;
}

export default function Graph({ height, links, nodes, width }: Props) {
  const simulation = d3
    .forceSimulation<D3Node, D3Link>()
    .force(
      "link",
      d3.forceLink<D3Node, D3Link>().id((d) => d.id)
    )
    .force("charge", d3.forceManyBody().strength(-100))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .nodes(nodes);

  simulation.force<ForceLink<D3Node, D3Link>>("link")?.links(links);

  useEffect(() => {
    simulation.nodes(nodes).on("tick", () => {
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
      <Links links={links} />
      <Nodes nodes={nodes} simulation={simulation} />
      <Labels nodes={nodes} />
    </svg>
  );
}
