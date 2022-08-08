const { MessageEmbed } = require("discord.js");

module.exports = async (Bot, Interaction) => {
    const CustomId = Interaction.customId;

    const CommandRegex = /(?<=\_)(.*?)(?=\/)/
    const Command = CustomId.match(CommandRegex)[0];
    const ImportId = CustomId.split("/")[1];

    const Database = Bot.database;
    const Guild = Interaction.guild;
    const Member = Interaction.member;
    const Message = Interaction.message; 

    const ImportRoles = Bot.Configuration.commands.import_requests_approval_roles
    const GuildData = await Database.getGuild(Guild.id);
    const PendingImports = await JSON.parse(GuildData.pending_imports)
    const Import = PendingImports[ImportId];

    if (!Import) {
        return await Interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`Error: no import request matching \`${ImportId}\` was found.`)
                    .setColor("RED")
            ],

            ephemeral: true
        })
    }

    else if (!Member.roles.cache.find(role => ImportRoles.includes(`${role.id}`))) {
        return await Interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription()
                    .setColor("RED")
            ],

            ephemeral: true
        })
    }

    switch (Command) {
        case "import":
            const Errors = [];

            try {
                await Interaction.reply("Importing points. Please wait...")
            } catch (error) {}

            for (const PointValue in Import.import_data) {
                const PointData = Import.import_data[PointValue];

                for (const UserId of PointData) {
                    const User = await Database.getUser(UserId);

                    if (User) {
                        User.events_attended += parseInt(PointValue);

                        try {
                            await Database.setUser(UserId, User);
                        } catch (error) {
                            Errors.push(`Failed to update userData for <@${UserId}>. ${error}`)
                        }
                    } else {
                        Errors.push(`No user was found matching userId \`${UserId}\` (<@${UserId}>).`)
                    }
                }
            }

            if (Errors.length > 0) {
                return await Interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Attendance Import Results")
                            .setDescription(`One or more errors occured whilst importing attendance data. Errors:\n${Errors.join("\n")}`)
                            .setColor("RED")
                    ]
                })
            } else {
                delete PendingImports[Message.id];

                try {
                    await Database.setGuild(Guild.id, {
                        pending_imports: PendingImports
                    })
                } catch (error) {
                    return await Interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`Error updating pending_imports field in database. ${error}`)
                                .setColor("RED")
                        ]
                    })
                }

                try {
                    await Message.delete()
                } catch (error) {
                    Interaction.editReply(`Error deleting import message.`)
                }

                return await Interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Attendance Import Results")
                            .setDescription("Attendance data imported successfully.")
                            .setColor("GREEN")
                    ]
                })
            }
        case "delete":
            delete PendingImports[Message.id];

            try {
                await Database.setGuild(Guild.id, {
                    pending_imports: PendingImports
                })
            } catch (error) {
                return await Interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`Error updating pending_imports field in database. ${error}`)
                            .setColor("RED")
                    ]
                })
            }

            try {
                await Message.delete()
            } catch (error) {
                Interaction.reply(`Error deleting import message.`)
            }
            break;
    }
}