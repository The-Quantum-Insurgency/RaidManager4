const { getRankInGroup, getGamePasses, getUsernameFromId, getOwnership } = require("noblox.js");
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");

module.exports = async function(Bot, Guild, Member) {
    const Database = Bot.database;
    
    const GuildData = await Database.getGuild(Guild.id);
    const BindData = JSON.parse(GuildData.bind_data);

    const UserData = await Database.getUser(Member.id);
    const Errors = [];
    const Promises = [];

    if (!UserData) {
        Errors.push(`No userdata was found for ${Member.id}.`)
        return [false, Errors]
    }

    const UserId = UserData.roblox_id;

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
                        const GamepassComponents = Data.split(":") || [];

                        const PlaceId = GamepassComponents[0];
                        const GamepassId = GamepassComponents[1];
                        const Limit = GamepassComponents[2];

                        if (!PlaceId || !GamepassId) {
                            Errors.push(`Error applying role matching type ${Type}:${Data}. PlaceId or GamepassId missing.`)

                            break;
                        }

                        var Gamepasses = []

                        var UniverseId = 0;

                        try {
                            const MultigetDetails = await fetch(`https://games.roblox.com/v1/games/multiget-place-details?placeIds=${PlaceId}`, {
                                headers: {
                                    cookie: `.ROBLOSECURITY=${Bot.RaidManager.Environment.roblox.roblosecurity}`
                                }
                            }).then(res => res.json());

                            UniverseId = MultigetDetails[0].universeId
                        } catch (error) {
                            Errors.push(`Error fetching universeInfo for ${PlaceId}.`)

                            break;
                        }

                        try {
                            Gamepasses = await getGamePasses(UniverseId, Limit);
                        } catch (error) {
                            Errors.push(`Error fetching gamepasses from place ${PlaceId} with data ${Data}.`)

                            break;
                        }
                        
                        const Gamepass = await Gamepasses.find(pass => pass.id == GamepassId);

                        if (!Gamepass) {
                            Errors.push(`A gamepass matching ID ${GamepassId} could not be found with type \`${Type}\` and data \`${Data}\`.`)

                            break;
                        }

                        var UserOwnsGamepass = false;

                        try {
                            UserOwnsGamepass = await getOwnership(UserId, Gamepass.id, "GamePass");
                        } catch (error) {
                            Errors.push(`Ownership of gamepass ${Gamepass.id} could not be verified for user ${UserId}.`)

                            break;
                        }

                        if (UserOwnsGamepass) {
                            CanGetRole = true;

                            break;
                        }

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

    return [true, Errors]
}