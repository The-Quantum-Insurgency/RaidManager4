const {
  SlashCommandChannelOption,
  SlashCommandStringOption,
} = require("@discordjs/builders");

module.exports = {
  name: "say",
  description: "Debugging command to test bot activity.",

  options: [
    new SlashCommandChannelOption()
      .setName("channel")
      .setDescription("The chanenl to say the message in.")
      .setRequired(true),
    new SlashCommandStringOption()
      .setName("string")
      .setDescription("The string to say.")
      .setRequired(true),
  ],

  permissions: [],

  execute: async function (RaidManager, Interaction) {
    const Arguments = Interaction.options;

    const ChannelId = Arguments.get("channel").value;
    const String = Arguments.get("string").value;

    const Channel = await Interaction.guild.channels.resolve(ChannelId);

    if (Channel) {
      try {
        await Channel.send(String);
        await Interaction.reply("success");
      } catch (error) {
        await Interaction.reply("fail");
      }
    } else {
      return Interaction.reply("fail");
    }
  },
};
