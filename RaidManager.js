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
  DEBUG: false,
  EXITED: false,

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
  up: async (Debug) => {
    // Set debug
    RaidManager.DEBUG = Debug;

    const Logger = new (require("./framework/logger"))(RaidManager);

    console.log = Logger.log;
    console.warn = Logger.warn;
    console.error = Logger.error;
    console.debug = Logger.debug;

    console.log("RaidManager4 is starting. Please wait...");

    console.debug("Creating lockfile...");

    // Create lockfile
    const PID = process.pid;
    FileSystem.writeFileSync("./raidmanager.lock", PID.toString());

    console.debug("Registering interrupt handles...");

    process.on("exit", RaidManager.down);
    process.on("SIGINT", RaidManager.down);
    process.on("SIGTERM", RaidManager.down);
    process.on("uncaughtException", RaidManager.onError);

    console.debug("Loading utility classes...");
    // Load utility classes
    const Utilities = FileSystem.readdirSync("util");
    await Utilities.forEach((File) => {
      const Name = File.replace(".js", "");
      const Class = require(`./util/${File}`);

      RaidManager[Name] = new Class(RaidManager);
    });

    // Initialize database
    console.debug("Initializing database...");
    await RaidManager.database.up();

    if (Environment.app.BOT_ENABLED) {
      console.debug("Bot enabled! Loading...");

      console.debug("Parsing bot.toml...");
      const Configuration = await TOML.parse(
        FileSystem.readFileSync(".config/bot/bot.toml")
      );

      console.debug("Defining RaidManager environment...");
      RaidManager.Environment = {
        bot: Configuration,
        ...RaidManager.Environment,
      };

      console.debug("Creating new Bot object...");
      const BotClass = require("./bot");
      const Bot = new BotClass(RaidManager);

      RaidManager.Bot = Bot;

      console.debug("Calling bot start...");
      await Bot.up();
    }

    console.log(`RaidManager4 @ ${RaidManager.VERSION} successfully loaded.`);
  },

  reload: async () => {},

  down: async (err) => {
    if (RaidManager.EXITED) return;

    await console.warn("Exiting RaidManager4...");

    if (err && err != "SIGINT" && err != "SIGTERM") {
      await console.error(
        `Error: RaidManager is exiting with one or more errors. \n${err}\n`
      );
    }

    await console.debug("Stopping bot...");
    if (RaidManager.Bot) {
      await RaidManager.Bot.down();
    }

    await console.debug("Deleting lockfile...");
    try {
      FileSystem.unlinkSync("./raidmanager.lock");
    } catch (err) {
      await console.error("ERROR: FAILED TO DELETE LOCKFILE.");
      process.exit(1);
    }

    RaidManager.EXITED = true;

    console.log("RaidManager4 successfully stopped. Goodbye!");

    process.exit(0);
  },

  onError: async (err) => {
    console.error(err.stack);
  },
};

module.exports = RaidManager;
