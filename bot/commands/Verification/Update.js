const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
    name: "update",
    description: "Allows users to re-fetch their roles and reset their nickname.",

    cooldown: 300,

    execute: async function (Bot, Interaction) {
        await Interaction.deferReply();
        
        const Member = Interaction.member;
        const Guild = Interaction.guild;

        const [ Success, Errors ] = await Bot.updateUser(Bot, Guild, Member);

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