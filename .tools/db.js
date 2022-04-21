#!/usr/bin/node

/**
 * @name db.js
 * @description RaidManager CLI Database Tool
 * @package raidmanager
 * @author imskyyc
 */

// RaidManager CLI Database Tool
// You can run this manually but it's better to go through the RaidManager CLI.
const { dirname } = require("path");
exports.execute = async function (args) {
  const appDir = dirname(require.main.filename)
  const package = require(`${appDir}/package.json`);
};
