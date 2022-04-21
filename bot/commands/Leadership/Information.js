const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "information",
  description:
    "For leadership to send the TQI information in the information channel.",

  permissions: [],

  execute: async function (RaidManager, Interaction) {
    const Config = RaidManager.Configuration;

    const InformationSections = Config.information_sections;

    const Channel = await Interaction.guild.channels.resolve(
      "857449102220591114"
    );
    for (const Index in InformationSections) {
      const EmbedData = InformationSections[Index];

      const Embed = new MessageEmbed(EmbedData);

      try {
        await Channel.send({
          embeds: [Embed],
        });
      } catch (error) {
        console.log(error);
        await Interaction.reply("fail");

        break;
      }
    }

    await Interaction.reply("success");
  },
};
