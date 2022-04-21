const { MessageEmbed } = require("discord.js");
const Roblox = require("noblox.js");

module.exports = {
  name: "mydata",
  description: "Lets users view their TQI data.",

  cooldown: 30,

  execute: async function (RaidManager, Interaction) {
    const Database = RaidManager.Database;

    const Member = Interaction.member;
    const User = await Database.GetUser(Member.id);

    const DataEmbed = new MessageEmbed()
      .setTitle("TQI Userdata")
      .setDescription(`Fetching userdata for <@${Member.id}>.`)
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

      DataEmbed.setDescription(`Userdata for <@${Member.id}>.`);
      DataEmbed.setColor("GREEN");
      DataEmbed.addField("Events Attended", EventsAttended, true);
      DataEmbed.addField("Squadron", Squadron, true);
      DataEmbed.addField("TQI Rank", Rank, true);

      return Interaction.editReply({
        embeds: [DataEmbed],
      });
    } else {
      DataEmbed.setDescription(
        `Userdata for <@${Member.id}> could not be fetched.`
      );
      DataEmbed.setColor("RED");

      return Interaction.editReply({
        embeds: [DataEmbed],
      });
    }
  },
};
