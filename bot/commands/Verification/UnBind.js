const { SlashCommandStringOption, SlashCommandRoleOption, SlashCommandBooleanOption } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: "unbind",
    description: "Lets guild administrators unbind roblox group ranks / gamepasses / players from Discord roles.",

    permissions: ["NODE:ADMINISTRATOR"],

    options: [
        new SlashCommandRoleOption()
            .setName("role")
            .setDescription("The role to bind to.")
            .setRequired(true),

        new SlashCommandStringOption()
            .addChoices(
                { name: "group", value: "group" },
                { name: "gamepass", value: "gamepass" },
                { name: "userid", value: "userid" },
            )
            .setName("type")
            .setDescription("The type of asset to bind.")
            .setRequired(false),

        new SlashCommandStringOption()
            .setName("data")
            .setDescription("AssetId / GroupId:MinRank:MaxRank / UserId")
            .setRequired(false)
    ],

    execute: async function (Bot, Interaction) {
        await Interaction.deferReply({
            fetchReply: true
        });
        
        const Database = Bot.database;
        const Arguments = Interaction.options;
        const Guild = Interaction.guild;

        const RoleId = Arguments.getRole("role").id;
        const RoleType = Arguments.getString("type");
        const RoleData = Arguments.getString("data");

        const GuildData = await Database.getGuild(Guild.id) || await Database.setGuild(Guild.id);
        const BindData = JSON.parse(GuildData.bind_data);

        const RoleBindData = BindData[RoleId];

        async function pushBindsToDatabase(BindData) {
            var unbindString = "Success: Unbound ";

            if (RoleType != null && RoleData != null) {
                unbindString = unbindString + ` type \`${RoleType}\` with data \`${RoleData}\` from role <@&${RoleId}>.`;
            } else {
                unbindString = unbindString + ` <@&${RoleId}>.`
            }

            try {
                await Database.setGuild(Guild.id, {
                    bind_data: BindData
                })

                return Interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(unbindString)
                    ]
                })
            } catch (error) {
                return Interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`An internal error occurred whilst attempting create a new role bind. Error: \`${error}\``)
                    ]
                })
            }
        }

        if (RoleBindData && RoleType != null && RoleData != null) {
            const Binds = RoleBindData.binds
            const Bind = await Binds.find(roleBind => roleBind.type == RoleType && roleBind.data == RoleData);
            const Index = Binds.indexOf(Bind);

            if (Bind) {
                await Binds.splice(Index, 1);

                pushBindsToDatabase(BindData);
            } else {
                return Interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`Error: No role bind data for type ${RoleType} and data ${RoleData} was found for role <@&${RoleId}>.`)
                    ]
                })
            }
        } else {
            if (!RoleType && !RoleData) {
                delete BindData[RoleId];

                pushBindsToDatabase(BindData);
            } else {
                return Interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`Error: No role bind data for role <@&${RoleId}> was found.`)
                    ]
                })
            }
        }
    }
}