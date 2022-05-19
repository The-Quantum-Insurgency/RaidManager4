/**
 * @name API
 * @description RaidManager4 REST API
 * @package raidmanager
 * @author imskyyc
 */

const FileSystem = require("fs");

module.exports = class API {
  constructor(RaidManager) {
    this.RaidManager = RaidManager;
    this.Configuration = RaidManager.Environment.api;
  }

  up = async () => {
    console.debug("========== BEGIN API LOAD OUTPUT ==========");
    console.debug("RaidManager API load called!");

    console.debug("Reading keysets directory...");
    const KeysetFiles = FileSystem.readdirSync(".config/api/keysets");

    const Keysets = [];
    for (const Index in KeysetFiles) {
      const FileName = KeysetFiles[Index];

      console.debug(`${FileName} found! Attempting to load keyset...`);

      try {
        Keysets[FileName] = JSON.parse(FileSystem.readFileSync(`.config/api/keysets/${FileName}`));
      } catch (err) {
        console.error(err);
        console.error(`Error: keyset file ${FileName} failed to load! See error above.`);
      }
    }

    console.debug("API keysets loaded!");
    this.Keysets = Keysets;

    console.debug("Parsing middleware...");
    const Middleware = []
    const MiddlewareFiles = FileSystem.readdirSync("./api/middleware");
    for (const Index in MiddlewareFiles) {
      const FileName = MiddlewareFiles[Index];

      try {
        Middleware[FileName] = require(`./middleware/${FileName}`);
      } catch (err) {
        console.error(err);
        console.error(`Error: middleware file ${FileName} failed to load! See error above.`);
      }
    }

    console.debug("API Middleware loaded!");
    this.Middleware = Middleware;

    console.debug("Parsing routes...");
    const Routes = []
    const RouteFiles = FileSystem.readdirSync("./api/routes");
    for (const Index in RouteFiles) {
      const FileName = RouteFiles[Index];

      try {
        Routes[FileName] = require(`./routes/${FileName}`);      } catch (err) {
        console.error(err);
        console.error(`Error: route file ${FileName} failed to load! See error above.`);
      }
    }

    console.debug("API routes loaded!");
    this.Routes = Routes;

    console.debug("========== END API LOAD OUTPUT ==========");
  };
  reload = async () => {};
  down = async () => {};
};
