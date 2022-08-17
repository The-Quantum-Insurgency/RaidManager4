const { MessageEmbed } = require("discord.js");

function firstToUpper(String) {
    return String.charAt(0).toUpperCase() + String.substring(1);
}

module.exports = async (Bot, Interaction) => {
    const CustomId = Interaction.customId;
    const RoleType = CustomId.split("/")[1];
    const RoleId = Bot.Configuration.commands.ping_role_map[RoleType];

    const Guild = Interaction.guild;
    const Member = Interaction.member;

    if (!RoleId) {
        return await Interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`Error: no role id was specified for ping type ${RoleType}. Please contact a guild administrator to resolve this.`)
                    .setColor("RED")
            ]
        })
    }

    const GuildRole = await Guild.roles.resolve(RoleId);
    
    if (!GuildRole) {
        return await Interaction.reply({
            embeds: [
                new MessageEmbed()
                .setDescription(`Error: no role matching id ${RoleId} was found. Please contact a guild administrator to resolve this.`)
                .setColor("RED")
            ]
        })
    }
    
    const MemberRole = await Member.roles.resolve(RoleId);
    
    if (MemberRole) {
        try {
            await Member.roles.remove(MemberRole);

            await Interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`Successfully enabled ${firstToUpper(RoleType)} pings.`)
                        .setColor("GREEN")
                ]
            })
        } catch (error) {
            await Interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`Error: failed to enable ${firstToUpper(RoleType)} pings. ${error}.`)
                        .setColor("RED")
                ]
            })
        }
    } else {
        try {
            await Member.roles.add(GuildRole);

            await Interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`Successfully disabled ${firstToUpper(RoleType)} pings.`)
                        .setColor("GREEN")
                ]
            })
        } catch (error) {
            await Interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`Error: failed to disable ${firstToUpper(RoleType)} pings. ${error}.`)
                        .setColor("RED")
                ]
            })
        }
    }
}