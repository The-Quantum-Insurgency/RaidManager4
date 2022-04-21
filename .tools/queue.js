#!/usr/bin/node

/**
 * @name queue.js
 * @description RaidManager database queue worker
 * @package raidmanager
 * @author imskyyc
 */

// RaidManager CLI Queue System
// You can run this manually but it's better to go through the RaidManager CLI.

exports.execute = async function (args) {
  const stdout = process.stdout;
  const stderr = process.stderr;
  const package = require(`${__dirname}/package.json`);

  switch (args[0]) {
    case "work":
      stdout.write("Running queue job...");

      require(`${package}/QueueWorker`)
  }
}