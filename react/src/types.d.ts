export type D3Node = {
  id: string;
  group: number;
};

export type D3Link = {
  source: string;
  target: string;
  value: number;
};

export type D3Graph = {
  nodes: D3Node[];
  links: D3Link[];
};
