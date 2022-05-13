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
const { writeFileSync, readFileSync, unlinkSync } = require("fs");
const { exec } = require("child_process");

exports.execute = async function (args) {
  const appDir = dirname(require.main.filename);
  const package = require(`${appDir}/package.json`);
  const appVersion = package.version;
  const isForceful = args.includes("--force");

  let lockFile = undefined;

  try {
    lockFile = readFileSync(`${appDir}/docker.lock`).toString();
  } catch (err) {
    lockFile = false;
  }
  switch (args[1]) {
    case "build":
      console.log(`Building docker image raidmanager:${appVersion}...`);

      const buildResult = exec(
        `docker build -t raidmanager:${appVersion} ${appDir}`,
        async (error, stdout, stderr) => {
          console.log(stdout);
        }
      );
      break;
    case "run":
      if (lockFile && !isForceful) {
        return console.error(
          `Error: RaidManager docker image is already running under containerId ${lockFile.substring(
            0,
            8
          )}. If you believe this is an error, run the docker:run command with the --force flag.`
        );
      }

      console.log(`Running docker image raidmanager:${appVersion}...`);

      const runResult = exec(
        `docker run -d raidmanager:${appVersion}`,
        async (error, stdout, stderr) => {
          const containerId = stdout;

          console.log(
            `RaidManager container with ID ${containerId} successfully started.`
          );

          try {
            writeFileSync(`${appDir}/docker.lock`, containerId);
          } catch (err) {
            console.error(err);
            console.error("ERROR WRITING DOCKER LOCKFILE FOR CONTAINER!");
          }
        }
      );
      break;
    case "stop":
      if (!lockFile) {
        return console.error(
          'Error: no docker lockfile was found. To view all running docker containers run "docker container ls"'
        );
      }

      console.log(
        `Stopping raidmanager:${appVersion} @ ${lockFile.substring(0, 8)}`
      );

      exec(
        `docker container stop ${lockFile}`,
        async (error, stdout, stderr) => {
          if (stderr) {
            return console.error(stderr);
          } else {
            try {
              unlinkSync(`${appDir}/docker.lock`);

              console.log(
                `Docker container raidmanager:${appVersion} @ ${lockFile.substring(
                  0,
                  8
                )} has been stopped successfully.`
              );
            } catch (err) {
              console.error(err);
              console.error("ERROR: UNABLE TO DELETE DOCKER LOCKFILE.");
            }
          }
        }
      );
      break;
    default:
      console.error("Error: Invalid command.");
      process.exit(1);
  }
};
