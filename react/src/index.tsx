import * as React from "react";
import * as ReactDOM from "react-dom";

import App from "./components/App";
import "./styles/index.css";
import data from "./miserables";

ReactDOM.render(
  <App
    graph={data}
    height={window.screen.availHeight}
    width={window.screen.availWidth}
  />,
  document.getElementById("root")
);
