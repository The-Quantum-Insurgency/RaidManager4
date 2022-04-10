/**
 * @name RaidManager.js
 * @author imskyyc
 * @description RaidManager4 entry file.
 */

const FileSystem = require("fs");
const TOML = require("toml");

const Environment = TOML.parse(FileSystem.readFileSync(".config/app.toml"));

// Instantiate the core RaidManager object
const RaidManager = {
  APP_NAME: Environment.app.APP_NAME,
  VERSION: Environment.app.APP_VERSION,

  Environment: Environment,

  Utilities: {},

  Bot: undefined,
  API: undefined,

  // RaidManager start function
  up: async () => {
    // Load utility functions
    const Utilities = FileSystem.readdirSync("util");
    await Utilities.forEach((File) => {
      const Name = File.replace(".js", "");
      const Class = require(`./util/${File}`);

      RaidManager[Name] = new Class(RaidManager);
    });

    // Initialize database
    RaidManager.database.up();

    if (Environment.app.BOT_ENABLED) {
      const BotClass = require("./bot");
    }
  },

  reload: async () => {},

  down: async () => {},
};

RaidManager.up();