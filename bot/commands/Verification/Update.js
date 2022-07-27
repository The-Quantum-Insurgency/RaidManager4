const { getRankInGroup, getGamePasses, getUniverseInfo } = require("noblox.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "update",
    description: "Allows users to re-fetch their roles and reset their nickname.",

    cooldown: 300,

    execute: async function (Bot, Interaction) {
        await Interaction.deferReply();
        
        const Database = Bot.database;
        const Member = Interaction.member;
        const Guild = Interaction.guild;

        const GuildData = await Database.getGuild(Guild.id);
        const BindData = JSON.parse(GuildData.bind_data);

        const UserData = await Database.getUser(Member.id);

        console.oldLog(UserData);

        if (!UserData) {
            return await Interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("RaidManager Verification")
                        .setDescription(`No userdata was found for ${Member.id}.`)
                        .setColor("RED")
                        .setTimestamp()
                ],
                components: []
            })
        }

        const UserId = UserData.roblox_id;
        const Errors = [];
        const Promises = [];

        for (const RoleId in BindData) {
            console.log(RoleId)
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
                                GroupRank = await getRankInGroup(UserId);
                            } catch (error) {
                                Errors.push(`Error fetching GroupRank for ${UserId} in group ${GroupId} with data ${Data}.`)

                                break;
                            }

                            if (GroupRank >= MinRank && GroupRank <= MaxRank) {
                                CanGetRole = true;
                            }

                            break;
                        case "gamepass":
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
            }
        }

        await Promise.all(Promises);
    }
}