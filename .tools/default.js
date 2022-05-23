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
const { readFileSync, writeFileSync } = require("fs");
exports.execute = async function (args) {
  const appDir = dirname(require.main.filename);
  const raidManager = require(`${appDir}/RaidManager`);
  const lockFile = await raidManager.getLockFile();
  const package = require(`${appDir}/package.json`);
  const cliConfig = JSON.parse(readFileSync(`.raidmanagerrc`));

  switch (args[0]) {
    case "help":
      console.log(
        [`raidmanager4 @ ${package.version} | Help Dialogue:`].join("\n")
      );
      break;
    case "start":
      const debugEnabled = args.includes("--debug");

      if (lockFile) {
        console.error(
          `Error: RaidManager is already running. (PID ${lockFile})`
        );

        process.exit(1);
      }

      await raidManager.up(debugEnabled);

      break;
    case "stop":
      const isForceful = args.includes("--force");
      const isKill = args.includes("--kill");

      if (!lockFile && !isForceful && !isKill) {
        console.error(
          `Error: raidmanager.lock not found. To initiate a force stop, run "raidmanager stop --force".`
        );
      }

      process.kill(lockFile, (isKill && "SIGTERM") || "SIGINT");

      break;
    case "toggle-updates":
      const checkForUpdates = cliConfig.check_for_updates_on_start;

      if (checkForUpdates == undefined) {
        cliConfig.check_for_updates_on_start = false;
      } else {
        cliConfig.check_for_updates_on_start = !checkForUpdates;
      }

      try {
        writeFileSync(".raidmanagerrc", JSON.stringify(cliConfig));
      } catch (err) {
        console.error(err);
        console.error("ERROR: Unable to save .raidmanagerrc");
      }

      console.log(
        `Successfully set automatic update checking to ${cliConfig.check_for_updates_on_start
          .toString()
          .toUpperCase()}`
      );

      break;
    default:
      console.error("Error: Invalid command.");
      process.exit(1);
  }
};
