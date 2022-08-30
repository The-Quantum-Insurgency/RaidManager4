/**
 * @name API
 * @description RaidManager4 REST API
 * @package raidmanager
 * @author imskyyc
 */

const FileSystem = require("fs");
const Server = require("express")();

module.exports = class API {
  constructor(RaidManager) {
    this.RaidManager = RaidManager;
    this.Configuration = RaidManager.Environment.api;
  }

  GetKeysets = async () => {
    console.debug("Reading keysets directory...");
    const KeysetFiles = FileSystem.readdirSync(".config/api/keysets");

    const Keysets = [];
    for (const Index in KeysetFiles) {
      const FileName = KeysetFiles[Index];

      console.debug(`${FileName} found! Attempting to load keyset...`);

      try {
        Keysets[FileName.replace(".json", "")] = JSON.parse(
          FileSystem.readFileSync(`.config/api/keysets/${FileName}`)
        );
      } catch (err) {
        console.error(err);
        console.error(
          `Error: keyset file ${FileName} failed to load! See error above.`
        );
      }
    }

    return Keysets;
  };

  GetMiddleware = async () => {
    console.debug("Parsing middleware...");
    const Middleware = [];
    const MiddlewareFiles = FileSystem.readdirSync("./api/middleware");
    for (const Index in MiddlewareFiles) {
      const FileName = MiddlewareFiles[Index];

      try {
        Middleware[
          FileName.replace(".json", "")
        ] = require(`./middleware/${FileName}`);
      } catch (err) {
        console.error(err);
        console.error(
          `Error: middleware file ${FileName} failed to load! See error above.`
        );
      }
    }

    return Middleware;
  };

  ParseRouteFolder = async (Folder) => {
    const Routes = [];

    return Routes;
  };

  GetRoutes = async () => {
    console.debug("Parsing routes...");
    const Routes = [];

    const RequestTypes = FileSystem.readdirSync("./api/routes");
    for (const File of RequestTypes) {
      var RequestPath = "";

    }
    /*
    const RouteFiles = FileSystem.readdirSync("./api/routes");
    for (const Index in RouteFiles) {
      const FileName = RouteFiles[Index];

      try {
        Routes[FileName.replace(".json", "")] = require(`./routes/${FileName}`);
      } catch (err) {
        console.error(err);
        console.error(
          `Error: route file ${FileName} failed to load! See error above.`
        );
      }
    }
    */

    return Routes;
  };

  up = async () => {
    console.debug("========== BEGIN API LOAD OUTPUT ==========");
    console.debug("RaidManager API load called!");

    const Keysets = await this.GetKeysets();

    if (Keysets["example.keyset"]) {
      console.warn(
        "WARNING: EXAMPLE API KEYSET LOADED. To run the RaidManager REST API, you must delete or modify the example keyset"
      );
      return;
    }

    console.debug("API keysets loaded!");
    this.Keysets = Keysets;

    const Middleware = await this.GetMiddleware();

    console.debug("API Middleware loaded!");
    this.Middleware = Middleware;

    const Routes = await this.GetRoutes();

    console.debug("API routes loaded!");
    this.Routes = Routes;

    Server.get("/", async (Request, Response) => {
      return Response.json({success: true, message: "RaidManager4 REST API online and ready."});
    });

    console.debug("Start express");
    Server.listen(this.Configuration.api.bind_port);

    console.log("RaidManager API successfully started!");
    console.debug("========== END API LOAD OUTPUT ==========");
  };
  reload = async () => {};
  down = async () => {};
};
