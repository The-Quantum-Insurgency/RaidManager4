const { MessageEmbed } = require("discord.js");
const { SlashCommandUserOption } = require("@discordjs/builders")
const { getRankNameInGroup } = require("noblox.js");

module.exports = {
  name: "getdata",
  description: "Lets guild administrators fest verified user's data.",

  options: [
    new SlashCommandUserOption()
      .setName("user")
      .setDescription("The user to fetch data from.")
      .setRequired(true)
  ],

  execute: async function (Bot, Interaction) {
    await Interaction.deferReply();

    const Database = Bot.database;
    const Guild = Interaction.guild;
    const UserId = Interaction.options.getUser("user").id;

    const Member = await Guild.members.resolve(UserId);
    const User = await Database.getUser(Member.id);

    if (User) {
      let Rank = "Unknown";

      try {
        Rank = await getRankNameInGroup(Bot.Configuration.commands.main_group, User.roblox_id);
      } catch (error) {
        console.log(error);
      }

      const EventsAttended = User.events_attended.toString();
      const Squadron = User.squadron;
      
      return await Interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle("RaidManager Userdata")
            .setDescription(`Showing userdata for <@${Member.id}>.`)
            .setColor("GREEN")
            .addFields([
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
        ],
      });
    } else {
      return await Interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle("RaidManager Userdata")
            .setDescription(`Userdata for <@${Member.id}> could not be fetched.`)
            .setColor("RED")
        ],
      });
    }
  },
};
