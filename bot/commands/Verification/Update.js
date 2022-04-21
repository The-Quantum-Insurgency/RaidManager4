const { SlashCommandUserOption } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "update",
  description: "Lets admins update guild members.",
  options: [
    new SlashCommandUserOption()
      .setName("user")
      .setDescription("The user to update.")
      .setRequired(true),
  ],

  cooldown: 30,

  permissions: ["NODE:ADMINISTRATOR"],

  execute: async function (RaidManager, Interaction) {
    const Database = RaidManager.Database;
    const Arguments = Interaction.options;

    const Guild = Interaction.guild;
    const APIUser = Arguments.get("user");
    const UserId = APIUser.id || APIUser.user.id;
    const User = await Database.GetUser(UserId);

    const GuildMember = await Guild.members.resolve(UserId);

    if (User && GuildMember) {
      Interaction.member = GuildMember;
      return RaidManager.UpdateUser(RaidManager, Interaction, User);
    } else {
      const ErrorEmbed = new MessageEmbed()
        .setTitle("TQI Account Update")
        .setDescription(
          `No user matching User Id ${UserId} was found, or a GuildMember was unable to be resolved.`
        )
        .setColor("RED");

      return Interaction.reply({
        embeds: [ErrorEmbed],
      });
    }
  },
};
