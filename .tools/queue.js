#!/usr/bin/node

/**
 * @name queue.js
 * @description RaidManager database queue worker
 * @package raidmanager
 * @author imskyyc
 */

// RaidManager CLI Queue System
// You can run this manually but it's better to go through the RaidManager CLI.
const { dirname } = require("path");
exports.execute = async function (args) {
  const appDir = dirname(require.main.filename)
  const package = require(`${appDir}/package.json`);

  switch (args[0]) {
    case "work":
      console.log("Running queue job...");

      require(`${appDir}/QueueWorker`)
  }
}
