/**
 * @package raidmanager
 * @name guildCreate.js
 * @description Client guildCreate listener.
 * @author imskyyc
 */

module.exports = async (Bot, Guild) => {
  const Database = Bot.database;
  
  try {
    await Database.setGuild(Guild.id);
  } catch (error) {
    console.error(error)
    console.error(`Guild ${Guild.id} failed to create.`)
  }
}
