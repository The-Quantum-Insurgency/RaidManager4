const {
  SlashCommandUserOption,
  SlashCommandRoleOption,
} = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

const SquadronMap = ["Alpha", "Bravo", "Charlie", "Delta"];

module.exports = {
  name: "setsquadron",
  description: "Sets the squadron of the mentioned user.",
  options: [
    new SlashCommandUserOption()
      .setName("user")
      .setDescription("The user to add a event to.")
      .setRequired(true),
    new SlashCommandRoleOption()
      .setName("squadron")
      .setDescription("The squadron to set the user to.")
      .setRequired(true),
  ],

  permissions: ["ROLE:857447092817756160", "NODE:ADMINISTRATOR"],

  execute: async function (RaidManager, Interaction) {
    const Database = RaidManager.Database;
    const Arguments = Interaction.options;

    const Guild = Interaction.guild;

    const APIUser = await Arguments.getUser("user");
    const APIRole = await Arguments.getRole("squadron");

    const InteractionEmbed = new MessageEmbed()
      .setTitle("Set Squadron")
      .setDescription(`Setting <@${APIUser.id}>'s role to <@&${APIRole.id}>.`)
      .setColor("ORANGE");

    await Interaction.reply({
      embeds: [InteractionEmbed],
    });

    let User = await Database.GetUser(APIUser.id);
    const GuildMember = await Guild.members.fetch(APIUser.id);

    if (User) {
      let Role = await Guild.roles.fetch(APIRole.id);

      if (Role) {
        const Squadron = Role.name;

        if (SquadronMap.includes(Squadron)) {
          const [SquadronSet, Error] = await Database.SetSquadron(
            APIUser.id,
            Squadron
          );

          for (const Index in SquadronMap) {
            const SquadronName = SquadronMap[Index];
            const FoundRole = await GuildMember.roles.cache.find(
              (role) => role.name === SquadronName
            );

            if (FoundRole && SquadronName != Squadron) {
              try {
                await GuildMember.roles.remove(FoundRole);
              } catch (error) {
                Error += `The role <@&${FoundRole.id} was unable to be removed.`;
              }
            }
          }

          try {
            await GuildMember.roles.add(Role);
          } catch (error) {
            Error += `The role <@&${Role.id}> was unable to be added.`;
          }

          if (SquadronSet && !Error) {
            InteractionEmbed.setDescription(
              `Successfully set <@${APIUser.id}>'s squadron to ${Squadron}.`
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
          const SquadronString = "";

          for (const Index in SquadronMap) {
            SquadronString += `\n\`${SquadronMap[Index]}\``;
          }

          InteractionEmbed.setDescription(
            `${Squadron} is not a valid squadron. Valid squadrons are:${SquadronString}`
          );

          InteractionEmbed.setColor("RED");

          return Interaction.editReply({
            embeds: [InteractionEmbed],
          });
        }
      } else {
        InteractionEmbed.setDescription(
          `No role was found matching ID \`${APIRole.id}\``
        );

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
