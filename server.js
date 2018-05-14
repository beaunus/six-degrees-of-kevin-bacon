const express = require("express");
const serveStatic = require("serve-static");
const path = require("path");

const app = express();
const bodyParser = require("body-parser");

app.use("/", serveStatic(path.join(__dirname)));
app.use(bodyParser.json());

app.route("/api").get((req, res) => {
  const result = {
    nodes: [
      { id: "Brad Pitt", type: "actor" },
      { id: "Fight Club", type: "movie" },
      { id: "Edward Norton", type: "actor" }
    ],
    links: [
      { source: "Brad Pitt", target: "Fight Club" },
      { source: "Edward Norton", target: "Fight Club" }
    ]
  };
  res.status(200).json(result);
});

const port = process.env.PORT || 5000;
const server = app.listen(process.env.PORT || 5000);

console.log("Server started on port " + port + __dirname);

module.exports = server;
