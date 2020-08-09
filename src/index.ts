import { config } from "dotenv";
config();
import express from "express";
import serveStatic from "serve-static";
import path from "path";

const PORT = process.env.PORT || 1337;

const app = express();
import bodyParser from "body-parser";
import { router as api } from "./back-end/api";

app.use("/", serveStatic(path.join(`${__dirname}/front-end`)));
app.use(bodyParser.json());
app.use("/api", api);

import chalk from "chalk";

app.listen(process.env.PORT || 1337, () =>
  console.log(
    chalk.green.bold("Server listening on port: ") + chalk.cyan.bold(PORT)
  )
);
