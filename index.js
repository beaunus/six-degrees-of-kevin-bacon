const PORT = process.env.PORT || 1337; // default port to 1337

const app = require("./server.js"); // express
const chalk = require("chalk"); // great CL text coloring module

/* eslint-disable no-console */
app.listen(process.env.PORT || 1337, () =>
  console.log(
    // sets server to listen to PORT and outputs to the CL
    chalk.green.bold("Server listening on port: ") + chalk.cyan.bold(PORT)
  )
);
