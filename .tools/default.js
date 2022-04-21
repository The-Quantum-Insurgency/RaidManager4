#!/usr/bin/node

/**
 * @name db.js
 * @description RaidManager CLI Database Tool
 * @package raidmanager
 * @author imskyyc
 */

// RaidManager CLI command fallback
// You can run this manually but it's better to go through the RaidManager CLI.
exports.execute = async function (args) {
  const stdout = process.stdout;
  const stderr = process.stderr;
  const package = require(`${__dirname}/package.json`);

  switch (args[0]) {
    case "help":
      stdout.write(
        [`raidmanager4 @ ${package.version} | Help Dialogue:`].join("\n")
      );
      break;
    case "start":
      const raidManager = require(`${__dirname}/RaidManager`);
      const lockFile = await raidManager.getLockFile();

      if (lockFile) {
        stderr.write(
          `Error: RaidManager is already running. (PID ${lockFile})`
        );

        process.exit(1)
      }

      await raidManager.up();

      break;
    default:
      stderr.write("Error: Invalid command.");
      process.exit(1);
  }
};
