import * as d3 from "d3";
import React, { useEffect, useRef } from "react";

import { D3Link } from "../types";

const Link: React.FC<{ link: D3Link }> = ({ link }) => {
  let thisRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    d3.select(thisRef).data([link]);
  });

  return (
    <line
      className="link"
      ref={(ref) => (thisRef = ref)}
      strokeWidth={Math.sqrt(link.value)}
    />
  );
};

const Links: React.FC<{ links: Array<D3Link> }> = ({ links }) => (
  <g className="links">
    {links.map((link, index) => (
      <Link key={index} link={link} />
    ))}
  </g>
);
export default Links;
