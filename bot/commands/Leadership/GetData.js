const { MessageEmbed } = require("discord.js");
const { SlashCommandUserOption } = require("@discordjs/builders");
const Roblox = require("noblox.js");

module.exports = {
  name: "getdata",
  description: "Lets TQI HRs view other user's data.",

  options: [
    new SlashCommandUserOption()
      .setName("user")
      .setDescription("The user to search data for.")
      .setRequired(true),
  ],

  permissions: ["ROLE:857447092817756160", "ROLE:857447098709704736"],

  cooldown: 30,

  execute: async function (RaidManager, Interaction) {
    const Database = RaidManager.Database;
    const Arguments = Interaction.options;

    const APIUser = await Arguments.getUser("user");
    const User = await Database.GetUser(APIUser.id);

    const DataEmbed = new MessageEmbed()
      .setTitle("TQI Userdata")
      .setDescription(`Fetching userdata for <@${APIUser.id}>.`)
      .setColor("ORANGE")
      .setFooter(await RaidManager.EmbedFooter(RaidManager));

    await Interaction.reply({
      embeds: [DataEmbed],
    });

    if (User) {
      let Rank = "Unknown";

      try {
        Rank = await Roblox.getRankNameInGroup(8592261, User.roblox_id);
      } catch (error) {
        console.log(error);
      }

      const EventsAttended = User.events_attended.toString();
      const Squadron = User.squadron;

      DataEmbed.setDescription(`Userdata for <@${APIUser.id}>.`);
      DataEmbed.setColor("GREEN");
      DataEmbed.addField("Events Attended", EventsAttended, true);
      DataEmbed.addField("Squadron", Squadron, true);
      DataEmbed.addField("TQI Rank", Rank, true);

      return Interaction.editReply({
        embeds: [DataEmbed],
      });
    } else {
      DataEmbed.setDescription(
        `Userdata for <@${APIUser.id}> could not be fetched.`
      );
      DataEmbed.setColor("RED");

      return Interaction.editReply({
        embeds: [DataEmbed],
      });
    }
  },
};
