const express = require("express");
const serveStatic = require("serve-static");
const path = require("path");

const app = express();
const bodyParser = require("body-parser");

app.use("/", serveStatic(path.join(__dirname)));
app.use(bodyParser.json());

app.route("/api").get((req, res) => {
  res.send(req.body);
});

const port = process.env.PORT || 5000;
app.listen(process.env.PORT || 5000);

console.log("Server started on port " + port + __dirname);
