import { SimulationLinkDatum, SimulationNodeDatum } from "d3";

export interface D3Node extends SimulationNodeDatum {
  id: string;
  group: number;
}

export interface D3Link extends SimulationLinkDatum<D3Node> {
  value: number;
}

export interface D3Graph {
  nodes: D3Node[];
  links: D3Link[];
}

export interface Coordinate {
  x: number;
  y: number;
}
