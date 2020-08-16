import * as d3 from "d3";
import React, { useEffect, useRef } from "react";

import { D3Link } from "../types";

function Link({ link }: { link: D3Link }) {
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
}

export default function Links({ links }: { links: Array<D3Link> }) {
  return (
    <g className="links">
      {links.map((link, index) => (
        <Link key={index} link={link} />
      ))}
    </g>
  );
}
