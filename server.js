const express = require("express");
const serveStatic = require("serve-static");
const path = require("path");

const app = express();
const bodyParser = require("body-parser");

app.use("/", serveStatic(path.join(__dirname)));
app.use(bodyParser.json());

app.route("/api").get((req, res) => {
  const result = {
    nodes: [],
    links: []
  };
  if (Array.isArray(req.body)) {
    for (const actor of req.body) {
      result.nodes.push(actor);
    }
  }
  res.status(200).json(result);
});

module.exports = app;
