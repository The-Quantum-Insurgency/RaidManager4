/**
 * @package raidmanager
 * @name placeholderParser.ts
 * @description A string conversion tool for %% placeholders
 * @author imskyyc
 * @param { RaidManager }
 */

const PlaceholderParser = class PlaceholderParser {
  RaidManager = null

  constructor(RaidManager) {
    this.RaidManager = RaidManager;
  }

  up = async function () {};
  reload = async function () {};
  down = async function () {};

  Parse = async function (String) {
    const RaidManager = this.RaidManager;
    const Placeholders = {
      BOT_VERSION: `${RaidManager.VERSION}`,
    };

    for (const Key in Placeholders) {
        String = String.replace(`%${Key}%`, Placeholders[Key])
    }

    return String;
  };
}

module.exports = PlaceholderParser;