const { SlashCommandRoleOption } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "toggledefaultrole",
    description: "Allows administrators to update an existing guild member.",

    options: [
        new SlashCommandRoleOption()
            .setName("role")
            .setDescription("The role to mark as a default role")
            .setRequired(true)
    ],

    permssions: ["NODE:ADMINISTRATOR"],

    execute: async function (Bot, Interaction) {
        await Interaction.deferReply({
            fetchReply: true
        });
        
        const Database = Bot.database;
        const Arguments = Interaction.options;
        const Guild = Interaction.guild;

        const GuildData = await Database.getGuild(Guild.id);
        const BindData = JSON.parse(GuildData.bind_data);

        const RoleId = await Arguments.getRole("role").id;
        const RoleData = BindData[RoleId];

        if (RoleData) {
            RoleData.isDefault = !RoleData.isDefault;
        } else {
            BindData[RoleId] = {
                binds: [],
                isDefault: true
            }
        }

        try {
            await Database.setGuild(Guild.id)

            return await Interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`Successfully updated role bind settings for <@&${RoleId}>.`)
                        .setColor("GREEN")
                ]
            })
        } catch (error) {
            return await Interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`Error updating guild \`${Guild.id}\`. Error: ${error}`)
                        .setColor("RED")
                ]
            })
        }
    }
}
