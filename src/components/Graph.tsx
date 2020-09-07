import * as d3 from "d3";
import { ForceLink } from "d3";
import React, { useEffect, useRef } from "react";

import { Coordinate, D3Link, D3Node } from "../types";

import Labels from "./Labels";
import Links from "./Links";
import Nodes from "./Nodes";

const Graph: React.FC<{
  baconNumber: number;
  links: Array<D3Link>;
  nodes: Array<D3Node>;
}> = ({ baconNumber, links, nodes }) => {
  const ref = useRef<HTMLDivElement>(null);

  const maxDimension = Math.max(
    Number(ref.current?.clientHeight),
    Number(ref.current?.clientHeight)
  );

  const simulation = d3
    .forceSimulation<D3Node, D3Link>()
    .force(
      "link",
      d3.forceLink<D3Node, D3Link>().id((d) => d.id)
    )
    .force(
      "charge",
      d3
        .forceManyBody()
        .strength(-maxDimension / (3 * Math.max(baconNumber, 1)))
    )
    .nodes(nodes);

  simulation.force<ForceLink<D3Node, D3Link>>("link")?.links(links);

  useEffect(() => {
    simulation.nodes(nodes).on("tick", () => {
      d3.selectAll<Element, Coordinate>(".node")
        .attr("cx", (d) => d?.x)
        .attr("cy", (d) => d?.y);

      d3.selectAll<Element, { source: Coordinate; target: Coordinate }>(".link")
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      d3.selectAll<Element, Coordinate>(".label")
        .attr("x", (d) => d?.x + 12)
        .attr("y", (d) => d?.y + 12);
    });
  });

  setImmediate(() => tryToSetForceCenter(ref.current, simulation));

  return (
    <div ref={ref} style={{ height: "100%", width: "100%" }}>
      <svg className="container" height="100%" width="100%">
        <Links links={links} />
        <Nodes nodes={nodes} simulation={simulation} />
        <Labels nodes={nodes} />
      </svg>
    </div>
  );
};

function tryToSetForceCenter(
  ref: HTMLDivElement | null,
  simulation: d3.Simulation<D3Node, D3Link>
) {
  ref?.clientHeight && ref.clientWidth
    ? simulation.force(
        "center",
        d3.forceCenter(
          ref.clientWidth / 2,
          (ref.clientHeight - ref.offsetTop) / 2
        )
      )
    : setImmediate(() => tryToSetForceCenter(ref, simulation));
}

export default Graph;
