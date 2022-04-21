const {
  SlashCommandChannelOption,
  SlashCommandStringOption,
} = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "embed",
  description: "Debugging command to test bot embed capability.",

  options: [
    new SlashCommandChannelOption()
      .setName("channel")
      .setDescription("The chanenl to say the message in.")
      .setRequired(true),
    new SlashCommandStringOption()
      .setName("title")
      .setDescription("The title of the embed.")
      .setRequired(true),
    new SlashCommandStringOption()
      .setName("description")
      .setDescription("The description of the embed.")
      .setRequired(true),
  ],

  permissions: [],

  execute: async function (RaidManager, Interaction) {
    const Arguments = Interaction.options;

    const ChannelId = Arguments.get("channel").value;
    const Title = Arguments.get("title").value;
    const Description = Arguments.get("description").value;

    const Channel = await Interaction.guild.channels.resolve(ChannelId);

    if (Channel) {
      try {
        const Embed = new MessageEmbed()
          .setTitle(Title)
          .setDescription(Description)
          .setFooter(await RaidManager.EmbedFooter(RaidManager))
          .setColor("DARK_GREEN")
          .setTimestamp();

        await Channel.send({
          embeds: [Embed],
        });
        await Interaction.reply("success");
      } catch (error) {
        console.log(error);
        await Interaction.reply("fail");
      }
    } else {
      return Interaction.reply("fail");
    }
  },
};
