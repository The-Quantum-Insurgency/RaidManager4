/**
 * @package RaidManager4
 * @name ready.js
 * @description Client onReady listener
 * @author imskyyc
 * @param { Bot } Bot
 */
const { Collection, MessageEmbed } = require("discord.js");

function FirstToUpper(String) {
  return String.charAt(0).toUpperCase() + String.subtring(1);
}

module.exports = async function (Bot, Interaction) {
  const Client = Bot.Client;
  const Member = Interaction.member;
  const Channel = Interaction.channel;
  const Guild = Interaction.guild;

  if (!Bot.CooldownData) {
    Bot.CooldownData = new Collection();
  }

  if (Interaction.isCommand()) {
    Bot.commandInteractionHandle(Bot, Interaction);
  }
};
