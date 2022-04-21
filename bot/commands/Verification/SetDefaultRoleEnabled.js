const { SlashCommandStringOption } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
module.exports = {
  name: "setdefaultroleenabled",
  description: "Lets guild administrators toggle default verification roles.",
  options: [
    new SlashCommandStringOption()
      .setName("roleid")
      .setDescription("The Discord RoleId to enable / disable.")
      .setRequired(true),
  ],

  permissions: ["NODE:ADMINISTRATOR"],

  execute: async function (RaidManager, Interaction) {
    const Database = RaidManager.Database;
    const Arguments = Interaction.options;

    const RoleId = Arguments.get("roleid").value;

    const Guild = Interaction.guild;
    const GuildData = (await Database.GetGuild(Guild.id)) || {};

    const BindEmbed = new MessageEmbed()
      .setColor("ORANGE")
      .setDescription(
        `Attempting to change the default status of role <@&${RoleId}>.`
      );

    await Interaction.reply({
      embeds: [BindEmbed],
    });

    const DefaultRoles = JSON.parse(GuildData.default_roles || "[]");

    const RoleEnabled = DefaultRoles.includes(RoleId);

    if (RoleEnabled) {
      const Index = DefaultRoles.indexOf(RoleId);
      DefaultRoles.splice(Index, 1);
    } else {
      DefaultRoles.push(RoleId);
    }

    const [GuildUpdated, Error] = await Database.SetDefaultRoles(
      Guild.id,
      DefaultRoles
    );

    if (GuildUpdated) {
      BindEmbed.setColor("GREEN");
      BindEmbed.description = `Role <@&${RoleId}> was successfully ${
        (RoleEnabled && "disabled") || "enabled"
      } as a default role.`;

      return Interaction.editReply({
        embeds: [BindEmbed],
      });
    } else {
      BindEmbed.setColor("RED");
      BindEmbed.description = `Error: ${Error}`;

      return Interaction.editReply({
        embeds: [BindEmbed],
      });
    }
  },
};
