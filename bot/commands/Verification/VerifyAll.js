const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "verifyall",
    description: "Allows administrators to update ALL guild members. **Run this command sparingly.**",

    permssions: ["NODE:ADMINISTRATOR"],
    cooldown: 600,

    execute: async function (Bot, Interaction) {
        await Interaction.deferReply();
        
        const Channel = Interaction.channel;
        const Member = Interaction.member;
        const Guild = Interaction.guild;

        const Members = await Guild.members.list({
            limit: 1000
        });

        await Interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Verify All")
                    .setDescription(`Attempting to verify all guild members (${Members.size}). This **will** take some time.`)
                    .addFields([
                        {
                            name: "Progress",
                            value: `Verified 0/${Members.size}`
                        }
                    ])
                    .setColor("ORANGE")
            ]
        });
        
        var Index = 0;
        for (const Key of Array.from(Members.keys())) {
            const GuildMember = Members.get(Key);

            Index++;

            const [ Success, Errors ] = await Bot.updateUser(Bot, Guild, GuildMember);

            if (Errors.length > 0) {
                try {
                    await Channel.send({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Verify All")
                                .setDescription(`Error verifying guild member <@${GuildMember.id}>. Error(s):\n \`${Errors.join("\n")}\``)
                                .setColor("RED")
                        ]
                    })
                } catch (error) {}
            }

            if (Index % 20 == 0) {
                try {
                    await Interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Verify All")
                                .setDescription(`Attempting to verify all guild members (${Members.size}). This **will** take some time.`)
                                .addFields([
                                    {
                                        name: "Progress",
                                        value: `Verified ${Index}/${Members.size}`
                                    }
                                ])
                                .setColor("ORANGE")
                        ]
                    })
                } catch (error) {}
            }

            await new Promise((resolve) => {
                setTimeout(resolve, 5_000);
            })
        }

        await Interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Verify All")
                    .setDescription(`Verify All complete.`)
                    .addFields([
                        {
                            name: "Progress",
                            value: `Verified ${Members.size}/${Members.size}`
                        }
                    ])
                    .setColor("GREEN")
            ]
        })
    }
}
