const PORT = process.env.PORT || 1337;

const app = require("./back-end");
const chalk = require("chalk");

app.listen(process.env.PORT || 1337, () =>
  console.log(
    chalk.green.bold("Server listening on port: ") + chalk.cyan.bold(PORT)
  )
);
