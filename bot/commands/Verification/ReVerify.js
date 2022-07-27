const { getRankInGroup, getGamePasses, getUniverseInfo, getUsernameFromId } = require("noblox.js");
const { SlashCommandUserOption } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "reverify",
    description: "Lets guild administrators force-update a guild member's roles, and nickname.",

    permissions: ["NODE:ADMINISTRATOR"],

    options: [
        new SlashCommandUserOption()
            .setName("user")
            .setDescription("The user to force-update.")
            .setRequired(true)
    ],

    execute: async function (Bot, Interaction) {
        await Interaction.deferReply({
            fetchReply: true
        });
        
        const Database = Bot.database;
        const Arguments = Interaction.options;
        const Guild = Interaction.guild;

        const GuildData = await Database.getGuild(Guild.id);
        const BindData = JSON.parse(GuildData.bind_data);

        const User = Arguments.getUser("user");
        const UserData = await Database.getUser(User.id);

        const Member = await Guild.members.resolve(User.id);

        if (!UserData) {
            return await Interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("RaidManager Verification")
                        .setDescription(`No userdata was found for ${User.id}.`)
                        .setColor("RED")
                        .setTimestamp()
                ]
            })
        }

        if (!Member) {
            return await Interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("RaidManager Verification")
                        .setDescription(`No guild member was found matching userId ${User.id}`)
                        .setColor("RED")
                        .setTimestamp()
                ]
            })
        }

        const UserId = UserData.roblox_id;
        const Errors = [];
        const Promises = [];

        for (const RoleId in BindData) {
            const RoleData = BindData[RoleId];

            const Binds = RoleData.binds;
            const IsDefault = RoleData.isDefault;

            if (IsDefault) {
                Promises.push(async (resolve) => {
                    try {
                        await Member.roles.add(RoleId)

                        resolve();
                    } catch (error) {
                        Errors.push(`Error applying role <@&${RoleId}>. - \`${error} \``);
                        resolve();
                    }
                })

                continue;
            } else {
                var CanGetRole = false;

                for (const Index in Binds) {
                    const Bind = Binds[Index];

                    const Type = Bind.type;
                    const Data = Bind.data;

                    switch (Type) {
                        case "group":
                            const GroupComponents = Data.split(":") || [];

                            const GroupId = GroupComponents[0];
                            const MinRank = GroupComponents[1] || 1;
                            const MaxRank = GroupComponents[2] || 255;

                            if (!GroupId) {
                                Errors.push(`Error applying role matching type ${Type}:${Data}. GroupId component missing.`)

                                break;
                            }

                            var GroupRank = 0;

                            try {
                                GroupRank = await getRankInGroup(GroupId, UserId);
                            } catch (error) {
                                Errors.push(`Error fetching GroupRank for ${UserId} in group ${GroupId} with data ${Data}. ${error}`)

                                break;
                            }

                            if (GroupRank >= MinRank && GroupRank <= MaxRank) {
                                CanGetRole = true;
                            }

                            break;
                        case "gamepass":
                            continue;
                            const GamepassComponents = Data.split(":") || [];

                            const PlaceId = GamepassComponents[0];
                            const GamepassId = GamepassComponents[1];
                            const Limit = GamepassComponents[2];

                            if (!PlaceId || !GamepassId) {
                                Errors.push(`Error applying role matching type ${Type}:${Data}. PlaceId or GamepassId missing.`)

                                break;
                            }

                            var Gamepasses = []

                            const universeInfo = await getUniverseInfo([PlaceId]);

                            console.oldLog(universeInfo);

                            try {
                                Gamepasses = await getGamePasses(PlaceId, Limit);
                            } catch (error) {
                                Errors.push(`Error developer products from place ${PlaceId} with data ${Data}.`)

                                console.oldLog(error);

                                break;
                            }
                            
                            console.oldLog(Gamepasses)

                            break;
                        case "userid":
                            if (UserId == Data) {
                                CanGetRole = true;
                            }

                            break;
                        default:
                            Errors.push(`Error applying role matching type ${Type}:${Data}. Invalid type.`)
                            break;
                    }
                }

                if (CanGetRole) {
                    Promises.push(async (resolve) => {
                        try {
                            await Member.roles.add(RoleId)
    
                            resolve();
                        } catch (error) {
                            Errors.push(`Error applying role <@&${RoleId}>. - \`${error} \``);
                            resolve();
                        }
                    })
                } else {
                    Promises.push(async (resolve) => {
                        try {
                            const ExistingRole = await Member.roles.resolve(RoleId);
                            
                            if (ExistingRole) {
                                await Member.roles.remove(ExistingRole)
                            }
    
                            resolve();
                        } catch (error) {
                            Errors.push(`Error removing role <@&${RoleId}>. - \`${error} \``);
                            resolve();
                        }
                    })
                }
            }
        }

        for (const FunctionIndex in Promises) {
            const Function = Promises[FunctionIndex];

            await new Promise(Function);
        }

        try {
            await Member.setNickname(await getUsernameFromId(UserId))
        } catch (error) {
            Errors.push(`Error setting user nickname. ${error}.`)
        }

        return await Interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setTitle("RaidManager Verification")
                    .setDescription(`Update complete. ${(Errors.length > 0 && `Errors: \n${Errors.join("\n")}`) || ""}`)
                    .setColor("ORANGE")
                    .setTimestamp()
            ]
        })
    }
}