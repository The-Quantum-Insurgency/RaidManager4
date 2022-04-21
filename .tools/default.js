#!/usr/bin/node

/**
 * @name db.js
 * @description RaidManager CLI Database Tool
 * @package raidmanager
 * @author imskyyc
 */

// RaidManager CLI command fallback
// You can run this manually but it's better to go through the RaidManager CLI.
const { dirname } = require("path");
exports.execute = async function (args) {
  const appDir = dirname(require.main.filename)
  const package = require(`${appDir}/package.json`);

  switch (args[0]) {
    case "help":
      console.log(
        [`raidmanager4 @ ${package.version} | Help Dialogue:`].join("\n")
      );
      break;
    case "start":
      const raidManager = require(`${appDir}/RaidManager`);
      const lockFile = await raidManager.getLockFile();
      const debugEnabled = args.includes("--debug")

      if (lockFile) {
        console.error(
          `Error: RaidManager is already running. (PID ${lockFile})`
        );

        process.exit(1)
      }

      await raidManager.up(debugEnabled);

      break;
    default:
      console.error("Error: Invalid command.");
      process.exit(1);
  }
};
