const { MessageEmbed } = require("discord.js");
const { SlashCommandUserOption, SlashCommandStringOption } = require("@discordjs/builders")

module.exports = {
  name: "setsquadron",
  description: "Lets guild administrators set any verified user to the specified squadron.",

  options: [
    new SlashCommandUserOption()
      .setName("user")
      .setDescription("The user to fetch data from.")
      .setRequired(true),

    new SlashCommandStringOption()
      .setName("squadron")
      .setDescription("The squadron to set the user to.")
      .setRequired(true)
      .addChoices(
        { name: "none", value: "None"},
        { name: "alpha", value: "Alpha" },
        { name: "bravo", value: "Bravo" },
        { name: "charlie", value: "Charlie" },
        { name: "delta", value: "Delta" }
      )
  ],

  execute: async function (Bot, Interaction) {
    await Interaction.deferReply();

    const Database = Bot.database;
    const Arguments = Interaction.options;

    const UserId = Arguments.getUser("user").id;
    const Squadron = Arguments.getString("squadron");

    try {
      await Database.setUser(UserId, {
        squadron: Squadron
      })

      await Interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setDescription(`Successfully set squadron to ${Squadron} for <@${UserId}>.`)
            .setColor("GREEN")
        ]
      })
    } catch (error) {
      await Interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setDescription(`Error setting squadron for <@${UserId}>. \`${error}\``)
            .setColor("RED")
        ]
      })
    }
  },
};
