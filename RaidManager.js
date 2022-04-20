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

  getLockFile: async () => {
    let lockFile = undefined;

    try {
      lockFile = FileSystem.readFileSync("./raidmanager.lock");
    } catch (err) {
      return null;
    }

    return lockFile;
  },

  // RaidManager start function
  up: async () => {
    // Create lockfile
    const PID = process.pid;
    FileSystem.writeFileSync("./raidmanager.lock", PID.toString());

    process.on("exit", RaidManager.down);
    process.on("SIGINT", RaidManager.down);

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
      const Configuration = await TOML.parse(
        FileSystem.readFileSync(".config/bot/bot.toml")
      );
      RaidManager.Environment = {
        bot: Configuration,
        ...RaidManager.Environment,
      };

      const BotClass = require("./bot");
      const Bot = new BotClass(RaidManager);

      RaidManager.Bot = Bot;
      await Bot.up();
    }
  },

  reload: async () => {},

  down: async () => {
    if (RaidManager.Bot) {
      await RaidManager.Bot.down();
    }

    try {
      FileSystem.unlinkSync("./raidmanager.lock");
    } catch (err) {
      process.stderr.write("ERROR: FAILED TO DELETE LOCKFILE.");
      process.exit(1);
    }

    process.exit(0);
  },
};

module.exports = RaidManager;
