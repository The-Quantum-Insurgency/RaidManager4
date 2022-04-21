const {
  SlashCommandUserOption,
  SlashCommandRoleOption,
} = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

const SquadronMap = ["Alpha", "Bravo", "Charlie", "Delta"];

module.exports = {
  name: "unsetsquadron",
  description: "Unsets the squadron of the mentioned user.",
  options: [
    new SlashCommandUserOption()
      .setName("user")
      .setDescription("The user to add a event to.")
      .setRequired(true),
  ],

  permissions: ["ROLE:857447092817756160", "NODE:ADMINISTRATOR"],

  execute: async function (RaidManager, Interaction) {
    const Database = RaidManager.Database;
    const Arguments = Interaction.options;

    const Guild = Interaction.guild;

    const APIUser = await Arguments.getUser("user");

    const InteractionEmbed = new MessageEmbed()
      .setTitle("Set Squadron")
      .setDescription(`Unsetting <@${APIUser.id}>'s squadron.`)
      .setColor("ORANGE");

    await Interaction.reply({
      embeds: [InteractionEmbed],
    });

    let User = await Database.GetUser(APIUser.id);
    const GuildMember = await Guild.members.fetch(APIUser.id);

    if (User) {
      const [SquadronSet, Error] = await Database.SetSquadron(
        APIUser.id,
        "None"
      );

      for (const Index in SquadronMap) {
        const SquadronName = SquadronMap[Index];
        const FoundRole = await GuildMember.roles.cache.find(
          (role) => role.name === SquadronName
        );

        if (FoundRole) {
          try {
            await GuildMember.roles.remove(FoundRole);
          } catch (error) {
            Error += `The role <@&${FoundRole.id} was unable to be removed.`;
          }
        }
      }

      if (SquadronSet && !Error) {
        InteractionEmbed.setDescription(
          `Successfully unset <@${APIUser.id}>'s squadron.`
        );

        InteractionEmbed.setColor("GREEN");

        return Interaction.editReply({
          embeds: [InteractionEmbed],
        });
      } else {
        InteractionEmbed.setDescription(
          `An error ocurred whilst updating the squadron for <@${GuildMember.id}>.`
        );

        if (!Error) {
          Error = "User failed to update.";
        }

        InteractionEmbed.addField("Error", Error);
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
