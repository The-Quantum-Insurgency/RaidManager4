/**
 * @package RaidManager4
 * @name ready.js
 * @description Client onReady listener
 * @author imskyyc
 * @param { Bot } Bot
 */

module.exports = async function (Bot) {
  console.log('ready');
  // Send slash commands to discord API
  const Commands = Bot.Commands;
  const CommandArray = await Bot.CommandCollectionToArray(Commands);

  await Bot.PushSlashCommands(CommandArray);
};
