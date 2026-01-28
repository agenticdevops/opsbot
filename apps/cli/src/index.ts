#!/usr/bin/env bun
/**
 * opsbot CLI - DevOps assistant with safety-first design
 */

import { Command } from "commander";
import { setupCommand } from "./commands/setup.js";
import { doctorCommand } from "./commands/doctor.js";

const program = new Command();

program
  .name("opsbot")
  .description("DevOps assistant with safety-first design")
  .version("0.1.0");

// Register commands
program.addCommand(setupCommand);
program.addCommand(doctorCommand);

// Start command placeholder
program
  .command("start")
  .description("Start the opsbot server")
  .option("-c, --config <path>", "Path to config file")
  .option("-p, --port <port>", "Port to listen on", "3000")
  .action(async (options) => {
    console.log("Starting opsbot server...");
    console.log("Config:", options.config || "~/.opsbot/config.json");
    console.log("Port:", options.port);
    console.log("\n⚠️  Server mode not yet implemented. Coming soon!");
  });

// Chat command placeholder
program
  .command("chat")
  .description("Start interactive chat (TUI)")
  .action(async () => {
    console.log("Starting opsbot chat...");
    console.log("\n⚠️  TUI mode not yet implemented. Coming soon!");
  });

program.parse();
