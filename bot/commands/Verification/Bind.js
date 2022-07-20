const { SlashCommandStringOption, SlashCommandRoleOption, SlashCommandBooleanOption } = require('@discordjs/builders');

module.exports = {
    name: "bind",
    description: "Lets guild administrators bind roblox group ranks / gamepasses / players to Discord roles.",

    permissions: ["NODE:ADMINISTRATOR"],

    options: [
        new SlashCommandStringOption()
            // .addChoices(
            //     { name: "group", value: "group" },
            //     { name: "gamepass", value: "gamepass" },
            //     { name: "userid", value: "userid" },
            // )
            .setName("type")
            .setRequired(true),

        // new SlashCommandStringOption()
        //     .setName("data")
        //     .setDescription("AssetId / GroupId:GroupRank / UserId")
        //     .setRequired(true),

        // new SlashCommandRoleOption()
        //     .setName("role")
        //     .setRequired(true),

        // new SlashCommandBooleanOption()
        //     .setName("default")
        //     .setDescription("Should the role be given to everyone after verifying?")
        //     .setRequired(false)
    ],

    execute: async function (Bot, Interaction) {

    }
}