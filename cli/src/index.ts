#!/usr/bin/env node

import { Command } from "commander";
const program = new Command();
program.version("0.0.1");

program
  .requiredOption("-c, --cheese <type>", "pizza must have cheese")
  .option("-d, --debug", "output extra debugging")
  .option("-s, --small", "small pizza size")
  .option("-p, --pizza-type <type>", "flavour of pizza");

program.parse(process.argv);

if (program.debug) console.log(program.opts());
console.log("pizza details:");
if (program.small) console.log("- small pizza size");
if (program.pizzaType) console.log(`- ${program.pizzaType}`);
