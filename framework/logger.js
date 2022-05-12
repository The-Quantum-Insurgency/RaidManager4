/**
 @name logger.js
 @description RaidManager logging utility.
 @author imskyyc
 @package raidmanager
 */

const chalk = require("chalk");
const moment = require("moment");
const consoleLog = console.log;
const consoleWarn = console.warn;
const consoleError = console.error;
const consoleDebug = console.debug;
var debugEnabled = false;

module.exports = class Logger {
  constructor(RaidManager) {
    this.RaidManager = RaidManager;
    debugEnabled = RaidManager.DEBUG;
  }

  async log(str) {
    const Timestamp = moment().format("YYYY-MM-DD HH:mm:ss");

    consoleLog(
      `${chalk.blue("[" + Timestamp + " | ")}${chalk.blue("INFO")}${chalk.blue(
        "]:"
      )} ${str}`
    );
  }

  async warn(str) {
    const Timestamp = moment().format("YYYY-MM-DD HH:mm:ss");

    consoleWarn(
      `${chalk.blue("[" + Timestamp + " | ")}${chalk.yellowBright(
        "WARN"
      )}${chalk.blue("]:")} ${str}`
    );
  }

  async error(str) {
    const Timestamp = moment().format("YYYY-MM-DD HH:mm:ss");

    consoleError(
      `${chalk.blue("[" + Timestamp + " | ")}${chalk.bgRedBright(
        "ERROR"
      )}${chalk.blue("]:")} ${str}`
    );
  }

  async debug(str) {
    const Timestamp = moment().format("YYYY-MM-DD HH:mm:ss");

    if (debugEnabled) {
      consoleDebug(
        `${chalk.blue("[" + Timestamp + " | ")}${chalk.cyan(
          "DEBUG"
        )}${chalk.blue("]:")} ${str}`
      );
    }
  }
};
