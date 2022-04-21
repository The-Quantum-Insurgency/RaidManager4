const {
  SlashCommandStringOption,
  SlashCommandNumberOption,
  SlashCommandBooleanOption,
} = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "bind",
  description:
    "Lets guild administrators bind ROBLOX Group Roles to Discord Roles.",
  options: [
    new SlashCommandNumberOption()
      .setName("groupid")
      .setDescription("The Group Id to bind to.")
      .setRequired(true),
    new SlashCommandStringOption()
      .setName("roleid")
      .setDescription("The Discord RoleId to bind to.")
      .setRequired(true),
    new SlashCommandNumberOption()
      .setName("rank")
      .setDescription("The rank number to bind to.")
      .setRequired(true),
  ],

  permissions: ["NODE:ADMINISTRATOR"],

  execute: async function (RaidManager, Interaction) {
    const Database = RaidManager.Database;
    const Arguments = Interaction.options;

    const GroupId = Arguments.get("groupid").value;
    const RoleId = Arguments.get("roleid").value;
    const RankId = Arguments.get("rank").value;

    const Guild = Interaction.guild;
    const GuildData = (await Database.GetGuild(Guild.id)) || {};

    const BindEmbed = new MessageEmbed()
      .setColor("ORANGE")
      .setDescription(
        `Attempting to bind ${GroupId}:${RankId} to <@&${RoleId}>`
      );

    await Interaction.reply({
      embeds: [BindEmbed],
    });

    const BindData = JSON.parse(GuildData.bind_data || "{}");
    const GroupData = BindData[GroupId] || {};
    const RankData = GroupData[RankId] || [];

    if (RankData.includes(RoleId)) {
      BindEmbed.setColor("RED");
      BindEmbed.description = `Error: role <@&${RoleId}> is already bound to group ${GroupId} at rank ${RankId}`;

      return Interaction.editReply({
        embeds: [BindEmbed],
      });
    }

    RankData.push(RoleId);

    GroupData[RankId] = RankData;
    BindData[GroupId] = GroupData;

    const [GuildUpdated, Error] = await Database.SetBindData(
      Guild.id,
      BindData
    );

    if (GuildUpdated) {
      BindEmbed.setColor("GREEN");
      BindEmbed.description = `Role <@&${RoleId}> was successfully bound to group ${GroupId} at rank ${RankId}.`;

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
