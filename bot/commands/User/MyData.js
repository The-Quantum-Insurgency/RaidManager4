const { MessageEmbed } = require("discord.js");
const Roblox = require("noblox.js");

module.exports = {
  name: "mydata",
  description: "Lets users view their TQI data.",

  cooldown: 30,

  execute: async function (Bot, Interaction) {
    const Database = Bot.database;

    const Member = Interaction.member;
    const User = await Database.getUser(Member.id);

    const DataEmbed = new MessageEmbed()
      .setTitle("TQI Userdata")
      .setDescription(`Fetching userdata for <@${Member.id}>.`)
      .setColor("ORANGE")

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
      DataEmbed.addFields([
        {
          name: "Events Attended",
          value: EventsAttended,
          inline: true
        },
        {
          name: "Squadron",
          value: Squadron,
          inline: true
        },
        {
          name: "TQI Rank",
          value: Rank,
          inline: true
        }
      ])
      
      return await Interaction.editReply({
        embeds: [DataEmbed],
      });
    } else {
      DataEmbed.setDescription(
        `Userdata for <@${Member.id}> could not be fetched.`
      );
      DataEmbed.setColor("RED");

      return await Interaction.editReply({
        embeds: [DataEmbed],
      });
    }
  },
};
