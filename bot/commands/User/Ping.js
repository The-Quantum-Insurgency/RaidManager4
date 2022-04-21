const { MessageEmbed } = require("discord.js");
const Roblox = require("noblox.js");

module.exports = {
  name: "ping",
  description: "Pong!",

  cooldown: 10,

  execute: async function (RaidManager, Interaction) {
    return Interaction.reply("Pong!", true);
  },
};
