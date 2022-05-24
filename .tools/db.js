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
const { readdirSync, readFileSync } = require("fs");
const { createConnection } = require("mysql2/promise");
const Bluebird = require("bluebird");
const TOML = require("toml");
const chalk = require("chalk");

exports.execute = async function (args) {
  const appDir = dirname(require.main.filename);
  const package = require(`${appDir}/package.json`);
  const appConfig = TOML.parse(readFileSync(".config/app.toml"));
  const dbConfig = appConfig.database;

  const connection = await createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.pass,
    database: dbConfig.base,
    Promise: Bluebird,
  });

  switch (args[0]) {
    case "init":
      console.log("Initializing RaidManager database...");

      console.log("Validating database migration files...");
      const migrations = readdirSync(".config/db").filter((file) =>
        file.endsWith(".js")
      );

      migrations.every((file) => {
        process.stdout.write(`Validating ${file}... `);
        const migrationTable = require(`${appDir}/.config/db/${file}`);

        if (migrationTable.up) {
          process.stdout.write(chalk.green("pass\n"));
          return true;
        } else {
          process.stdout.write(chalk.red("fail\n"));
          console.error(
            `${file} failed to validate. Please verify that ${file} has a up() method defined.`
          );

          process.exit(1);

          return false;
        }
      });

      console.log(
        "All migration files successfully validated. Beginning migration..."
      );
      console.log("Reading migrations table...");

      try {
        const [migrationTableRows] = await connection.query(
          "SELECT * FROM `migrations`"
        );
        console.log(migrationTableRows);
      } catch (err) {
        const [createMigrationTableResults] = await connection.query(
          "CREATE TABLE migrations();"
        );
      }
      break;
    default:
      console.error("Error: Invalid command.");

      connection.end();

      process.exit(1);
  }

  connection.end();
  process.exit(0);
};
