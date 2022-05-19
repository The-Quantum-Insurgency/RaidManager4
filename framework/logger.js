/**
 @name logger.js
 @description RaidManager logging utility.
 @author imskyyc
 @package raidmanager
 */

const FileSystem = require("fs");
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
    const FormattedString = `${chalk.blue("[" + Timestamp + " | ")}${chalk.blue(
      "INFO"
    )}${chalk.blue("]:")} ${str}`;

    consoleLog(FormattedString);
  }

  async warn(str) {
    const Timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
    const FormattedString = `${chalk.blue(
      "[" + Timestamp + " | "
    )}${chalk.yellowBright("WARN")}${chalk.blue("]:")} ${str}`;

    consoleWarn(FormattedString);
  }

  async error(str) {
    const Timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
    const FormattedString = `${chalk.blue(
      "[" + Timestamp + " | "
    )}${chalk.bgRedBright("ERROR")}${chalk.blue("]:")} ${str}`;

    consoleError(FormattedString);
  }

  async debug(str) {
    const Timestamp = moment().format("YYYY-MM-DD HH:mm:ss");

    if (debugEnabled) {
      const FormattedString = `${chalk.blue(
        "[" + Timestamp + " | "
      )}${chalk.cyan("DEBUG")}${chalk.blue("]:")} ${str}`;

      consoleDebug(FormattedString);
    }
  }
};
