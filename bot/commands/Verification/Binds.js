const { SlashCommandStringOption, SlashCommandRoleOption, SlashCommandBooleanOption } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: "binds",
    description: "Lets guild administrators get a list of binds registered to the guild.",

    permissions: ["NODE:ADMINISTRATOR"],

    execute: async function (Bot, Interaction) {
        await Interaction.deferReply({
            fetchReply: true
        });
        
        const Database = Bot.database;
        const Guild = Interaction.guild;
        
        const GuildData = await Database.getGuild(Guild.id) || await Database.setGuild(Guild.id);
        const BindData = JSON.parse(GuildData.bind_data);

        const BindStrings = []

        for (const Key in BindData) {
            const RoleData = BindData[Key];

            const Binds = RoleData.binds;
            const IsDefault = RoleData.isDefault || false;

            if (!IsDefault && Binds.length == 0) continue;

            var BindString = `<@&${Key}>: \n`;

            for (const Index in Binds) {
                const Bind = Binds[Index];

                BindString = BindString + ` - \`${Bind.type}:${Bind.data}\`; isDefault: \`${IsDefault}\`\n`
            }

            BindStrings.push(BindString);
        }

        const BindEmbed = new MessageEmbed()
            .setTitle(`${Guild.name} Role Bindings`)
            .setDescription(`List of all rolebinds for ${Guild.name}:\n${BindStrings}`)
            .setColor("ORANGE")

        return await Interaction.editReply({
            embeds: [BindEmbed]
        })
    }
}