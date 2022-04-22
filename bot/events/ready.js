/**
 * @package RaidManager4
 * @name ready.js
 * @description Client onReady listener
 * @author imskyyc
 * @param { Bot } Bot
 */
const FileSystem = require("fs/promises");

module.exports = async function (Bot) {
  // Check for raidmanager tempfile
  try {
    await FileSystem.stat("raidmanager.temp");

    const Tempdata = await (
      await FileSystem.readFile("raidmanager.temp")
    ).toString();

    const ShutdownData = Tempdata.split("\n");
    const ShutdownChannel = ShutdownData[0];
    const ShutdownMessage = ShutdownData[1];
  } catch (err) {
    if (err.code != "ENOENT") {
      console.error(`Error: ${err.path}: ${err.code} @ ${err.syscall}`);
    }
  }

  // Send slash commands to discord API
  const Commands = Bot.Commands;
  const CommandArray = await Bot.CommandCollectionToArray(Commands);

  await Bot.PushSlashCommands(CommandArray);
};
