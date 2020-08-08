require("dotenv").config();
const express = require("express");
const serveStatic = require("serve-static");
const path = require("path");

const PORT = process.env.PORT || 1337;

const app = express();
const bodyParser = require("body-parser");
const api = require("./back-end/api");

app.use("/", serveStatic(path.join(`${__dirname}/front-end`)));
app.use(bodyParser.json());
app.use("/api", api);

const chalk = require("chalk");

app.listen(process.env.PORT || 1337, () =>
  console.log(
    chalk.green.bold("Server listening on port: ") + chalk.cyan.bold(PORT)
  )
);
