const {
  SlashCommandUserOption,
  SlashCommandNumberOption,
} = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "dellog",
  description:
    "Removes an event from the total amount of events a player has attended.",
  options: [
    new SlashCommandUserOption()
      .setName("user")
      .setDescription("The user to remove an event from.")
      .setRequired(true),
    new SlashCommandNumberOption()
      .setName("amount")
      .setDescription(
        "(OPTIONAL) The amount of events to remove from the user."
      )
      .setRequired(false),
  ],

  permissions: ["ROLE:857447092817756160", "NODE:ADMINISTRATOR"],

  execute: async function (RaidManager, Interaction) {
    const Database = RaidManager.Database;
    const Arguments = Interaction.options;

    const APIUser = await Arguments.getUser("user");
    const Amount = (await Arguments.getNumber("amount")) || 1;

    const InteractionEmbed = new MessageEmbed()
      .setTitle("Event Logging")
      .setDescription(`Removing ${Amount} event log(s) to <@${APIUser.id}>.`)
      .setColor("ORANGE");

    await Interaction.reply({
      embeds: [InteractionEmbed],
    });

    let User = await Database.GetUser(APIUser.id);

    if (User) {
      User.events_attended -= Amount;

      const [EventsSaved, Error] = await Database.SetEvents(
        User.user_id,
        User.events_attended
      );

      if (EventsSaved) {
        InteractionEmbed.setDescription(
          `Successfully removed ${Amount} event(s) from <@${APIUser.id}>.`
        );
        InteractionEmbed.addField(
          "Events Attended",
          User.events_attended.toString(),
          true
        );
        InteractionEmbed.addField("Squadron", User.squadron, true);
        InteractionEmbed.setColor("GREEN");

        return Interaction.editReply({
          embeds: [InteractionEmbed],
        });
      } else {
        InteractionEmbed.setDescription(
          `An error occured whilst saving events.`
        );
        InteractionEmbed.addField("Error", Error.toString());
        InteractionEmbed.setColor("RED");

        return Interaction.editReply({
          embeds: [InteractionEmbed],
        });
      }
    } else {
      InteractionEmbed.setDescription(
        `No user was found for User ID <@${APIUser.id}>.`
      );
      InteractionEmbed.setColor("RED");

      return Interaction.editReply({
        embeds: [InteractionEmbed],
      });
    }
  },
};
