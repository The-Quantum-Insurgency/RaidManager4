const { SlashCommandStringOption, SlashCommandRoleOption, SlashCommandBooleanOption } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: "bind",
    description: "Lets guild administrators bind roblox group ranks / gamepasses / players to Discord roles.",

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
                { name: "none", value: "none" },
            )
            .setName("type")
            .setDescription("The type of asset to bind.")
            .setRequired(true),

        new SlashCommandStringOption()
            .setName("data")
            .setDescription("PlaceId:GamepassId:Limit / GroupId:MinRank:MaxRank / UserId")
            .setRequired(true),

        new SlashCommandBooleanOption()
            .setName("default")
            .setDescription("Should the role be given to everyone after verifying?")
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
        const RoleIsDefault = Arguments.getBoolean("default");

        const GuildData = await Database.getGuild(Guild.id) || await Database.setGuild(Guild.id);
        const BindData = JSON.parse(GuildData.bind_data);

        const RoleBindData = BindData[RoleId];

        async function pushBindsToDatabase(BindData) {
            try {
                await Database.setGuild(Guild.id, {
                    bind_data: BindData
                })

                return Interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`Success: Bound role <@&${RoleId}> to type \`${RoleType}\` with data \`${RoleData}\`.`)
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

        if (RoleBindData) {
            const Binds = RoleBindData.binds
            const Bind = await Binds.find(roleBind => roleBind.type == RoleType && roleBind.data == RoleData);

            if (Bind) {
                return Interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`Error: A role bind matching type ${RoleType} and data ${RoleData} already exists for role <@&${RoleId}>.`)
                    ]
                })
            } else {
                const Binds = RoleBindData.binds

                await Binds.push({
                    type: RoleType,
                    data: RoleData
                })

                return pushBindsToDatabase(BindData);
            }
        } else {
            BindData[RoleId] = {
                binds: [
                    {
                        type: RoleType,
                        data: RoleData,
                    },
                ],

                isDefault: RoleIsDefault
            }

            return pushBindsToDatabase(BindData);
        }
    }
}