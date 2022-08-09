const { MessageButton, MessageActionRow, MessageEmbed } = require("discord.js")
const UUID = require("uuid")

const EventColorMap = {
    Raid: "DARK_RED",
    Training: "DARK_GREEN",
    Other: "BLURPLE"
}

const EventThumbnailMap = {
    Raid: "",
    Training: ""
}

module.exports = {
    name: "import",
    description: "Allows insurgents+ and Sr. Training Advisors to schedule events for the group.",

    permissions: ["ROLE:857447098709704736", "NODE:ADMINISTRATOR", "ROLE:966594489777016863"],

    cooldown: 30,

    execute: async function (Bot, Interaction) {
        await Interaction.deferReply();

        const Database = Bot.database;

        const Channel = Interaction.channel;
        const Guild = Interaction.guild;
        const Member = Interaction.member;

        
    }
}