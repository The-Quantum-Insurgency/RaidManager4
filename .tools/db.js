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
  const isForceful = args.includes("--force");
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
      const migrationFiles = readdirSync(".config/db").filter((file) =>
        file.endsWith(".js")
      );

      const migrations = {};

      migrationFiles.every((file) => {
        process.stdout.write(`Validating ${file}... `);
        const migrationTable = require(`${appDir}/.config/db/${file}`);

        if (migrationTable.up) {
          console.log(chalk.green("pass"));

          migrations[file.replace(".js", "")] = migrationTable;

          return true;
        } else {
          console.log(chalk.red("fail"));
          console.error(
            `${file} failed to validate. Please verify that ${file} has a up() method defined.`
          );

          process.exit(1);
        }
      });

      console.log(
        "All migration files successfully validated. Beginning migration..."
      );
      console.log("Reading migrations table...");

      var migrationTableData = null;

      try {
        const [migrationTableRows] = await connection.query(
          "SELECT * FROM `migrations`"
        );

        migrationTableData = migrationTableRows;
      } catch (err) {
        process.stdout.write("Creating migration table... ");

        try {
          await connection.query(
            `CREATE TABLE migrations(
               \`table_name\` TINYTEXT NOT NULL,
               \`migrated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
             );`
          );
          console.log(chalk.green("SUCCESS"));
          migrationTableData = [];
        } catch (err) {
          console.log(chalk.red("FAIL"));
	  console.error(err);

          process.exit(1);
        }
      }

      console.log("Filtering migrations...");

      for (const Index in migrations) {
        process.stdout.write(`Checking for ${Index} in migrations table... `);

        const migrationEntry = migrationTableData.find(entry => entry.table_name == Index);

        if (migrationEntry && !isForceful) {
          console.log(chalk.red("exists"));
          delete migrations[Index];
        } else {
          console.log(chalk.green("empty"));
        }
      }

      console.log("Running database migrations...");

      if (Object.keys(migrations).length == 0) {
        console.log("Nothing to do.");
        process.exit(0);
      }

      for (const Index in migrations) {
        const migrationTable = migrations[Index];

        process.stdout.write(`Migrating ${Index}... `);
        try {
          const successful = await migrationTable.up(connection);
          
          if (successful) {
            await connection.query("INSERT INTO migrations(`table_name`) VALUES(?);", [Index]);
            console.log(chalk.green("SUCCESS"));
          } else {
            console.log(chalk.red("FAIL"))
          }
        } catch (err) {
          console.log(chalk.red("FAIL"));
          console.error(err);
        }
      }

      console.log("Database migration complete!");

      break;
    default:
      console.error("Error: Invalid command.");

      connection.end();

      process.exit(1);
  }

  connection.end();
  process.exit(0);
};
