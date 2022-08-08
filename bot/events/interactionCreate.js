/**
 * @package RaidManager4
 * @name ready.js
 * @description Client onReady listener
 * @author imskyyc
 * @param { Bot } Bot
 */
const { Collection, MessageEmbed } = require("discord.js");

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

  if (Interaction.isButton() && Interaction.customId.includes("point_")) {
    Bot.importInteractionHandle(Bot, Interaction);
  }
};
