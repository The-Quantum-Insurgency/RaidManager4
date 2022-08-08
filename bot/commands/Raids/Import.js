const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js")

module.exports = {
    name: "import",
    description: "Allows insurgents+ to import attendance data for a Major+ to approve.",

    permissions: ["ROLE:857447098709704736", "NODE:ADMINISTRATOR", "ROLE:966594489777016863"],

    execute: async function (Bot, Interaction) {
        await Interaction.deferReply();

        const Database = Bot.database;
        const Channel = Interaction.channel;
        const Member = Interaction.member;
        const Guild = Interaction.guild;

        var CoAuthorToggle = false;
        const ImportData = {};
        const CoAuthors = [Member.id]

        const ConfirmButton = new MessageButton()
            .setLabel("Submit")
            .setCustomId("submit")
            .setStyle("SUCCESS")

        const AddCoAuthorButton = new MessageButton()
            .setLabel("Add / Remove CoAuthor")
            .setStyle("SECONDARY")
            .setCustomId("coauthor")

        const CancelButton = new MessageButton()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle("SECONDARY")

        const ConfirmationActionRow = new MessageActionRow().addComponents([ConfirmButton, AddCoAuthorButton, CancelButton])

        const AttendanceEmbed = new MessageEmbed()
            .setTitle("Import Attendance")
            .setDescription("Please ping the players you wish to add / subtract event logs to / from, in the format: \n(Point Amount) - @user1,@user2,@user3,...\n\nExample: 2 - @imskyyc,@JustTucky,@tannibus\n\nExample 2: -2 - @imskyyc,@JustTucky,@tannibus\n\nTo add a co-author, ping them after pressing the \"Add CoAuthor\" button.\nImported data is shown below:")
            .setTimestamp()
            .setFooter({text: "Prompt will time out in 10 minutes."})
            .setColor("ORANGE")

        // Re-render Attendance embed
        async function renderAttendanceEmbed(skipEdit) {
            const Fields = []
            
            for (const PointValue in ImportData) {
                const PointData = ImportData[PointValue];

                if (PointData && PointData.length > 0) {
                    Fields.push({
                        name: `${PointValue} Event${(PointValue != 1 && "s") || ""}`,
                        value: `<@${PointData.join(">, <@")}>`
                    })
                }
            }

            AttendanceEmbed.setFields(Fields);

            if (!skipEdit) {
                await Interaction.editReply({
                    embeds: [AttendanceEmbed],
                    components: [ConfirmationActionRow]
                })
            }
        }

        // Send import
        async function sendImport() {
            const TempMessage = await Channel.send("Importing data. Please wait...");
            
            renderAttendanceEmbed(true);
            
            AttendanceEmbed.setTitle("Attendance Import Request");
            AttendanceEmbed.setFooter({text: ""});

            try {
                const GuildData = await Database.getGuild(Guild.id);
                const PendingImports = await JSON.parse(GuildData.pending_imports)
                
                if (PendingImports[Reply.id]) {
                    throw new Error(`An Attendance Import matching id ${Reply.id} already exists. Please try again.`)
                } else {
                    PendingImports[Reply.id] = {
                        host_id: Member.id,
                        import_data: ImportData
                    }

                    await Database.setGuild(Guild.id, {
                        pending_imports: PendingImports
                    })
                }
            } catch (error) {
                try {
                    TempMessage.delete()
                } catch (error) {}

                AttendanceEmbed.setColor("RED");
                AttendanceEmbed.setDescription(`Attendance data failed to import. Error: ${error}`)

                return await Interaction.editReply({
                    embeds: [AttendanceEmbed],
                    components: [],
                })
            }

            await Interaction.editReply({
                embeds: [AttendanceEmbed],
                components: [],
            })

            AttendanceEmbed.setDescription(`**Requested by**\n<@${Member.id}>\n**At**\n${new Date().toString()}\n**In**\n<#${Channel.id}>`)

            try {
                ConfirmButton.setLabel("Import")
                    .setCustomId(`point_import/${Reply.id}`);
                CancelButton.setLabel("Delete")
                    .setCustomId(`point_delete/${Reply.id}`)
                    .setStyle("DANGER");
                
                const Channel = await Bot.Client.channels.resolve(Bot.Configuration.commands.import_requests_channel_id);

                if (!Channel) {
                    throw new Error(`Channel ${Bot.Configuration.commands.import_requests_channel_id} does not exist or could not be found.`);
                } else {
                    await Channel.send({
                        embeds: [AttendanceEmbed],
                        components: [new MessageActionRow().setComponents(ConfirmButton, CancelButton)]
                    })
    
                    try {
                        await TempMessage.delete()
                    } catch (error) {}
        
                    AttendanceEmbed.setDescription("Attendance data has been imported.")
                    AttendanceEmbed.setColor("GREEN");
                    
                    await Interaction.editReply({
                        embeds: [AttendanceEmbed]
                    })
                }
            } catch (error) {
                AttendanceEmbed.setColor("RED");
                AttendanceEmbed.setDescription(`Attendance data failed to import. Error: ${error}`)

                await Interaction.editReply({
                    embeds: [AttendanceEmbed]
                })
            }

           
        }

        const Reply = await Interaction.editReply({
            embeds: [AttendanceEmbed],

            components: [ConfirmationActionRow],

            fetchReply: true
        })

        const InteractionFilter = (ButtonInteraction) => ButtonInteraction.member.id == Member.id
        const InteractionCollector = Reply.createMessageComponentCollector({
            filter: InteractionFilter,
            componentType: "BUTTON",
            time: 600_000
        })

        const MessageFilter = (Message) => CoAuthors.includes(Message.author.id)
        const MessageCollector = await Channel.createMessageCollector({
            filter: MessageFilter,
            time: 600_000,
        })

        // InteractionCollector events
        var PingCoAuthorMessage
        InteractionCollector.on('collect', async ButtonInteraction => {
            try {
                await ButtonInteraction.deferUpdate();
            } catch (error) {}

            switch (ButtonInteraction.customId) {
                case "submit":
                    sendImport();

                    MessageCollector.stop("SUBMITTED");
                    InteractionCollector.stop("SUBMITTED");

                    break;
                case "coauthor":
                    if (PingCoAuthorMessage) {
                        try {
                            PingCoAuthorMessage.delete()
                        } catch (error) {}
                    } else {
                        CoAuthorToggle = true

                        PingCoAuthorMessage = await Channel.send({
                            content: "Please ping the user you want to co-author this log with."
                        })
                    }

                    break;
                case "cancel":
                    InteractionCollector.stop("CANCELLED")
                    MessageCollector.stop("CANCELLED")

                    break;
            }
        })

        // MessageCollector events
        MessageCollector.on('collect', async message => {
            if (CoAuthorToggle) {
                CoAuthorToggle = false;

                var CoAuthorReply;
                const Mention = message.mentions.users.first();

                if (!Mention) {
                    CoAuthorReply = await message.reply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription("Error: no user was mentioned.")
                                .setColor("RED")
                                .setFooter({text: "Message will self-destruct in 10 seconds."})
                        ],
                    })
                } else {
                    if (Mention.id == Member.id) {
                        CoAuthorReply = await message.reply({
                            embeds: [
                                new MessageEmbed()
                                    .setDescription(`The original author cannot be removed.`)
                                    .setColor("RED")
                                    .setFooter({text: "Message will self-destruct in 10 seconds."})
                            ],
                        })
                    } else if (CoAuthors.includes(Mention.id)) {
                        const Index = CoAuthors.indexOf(Mention.id)
                        CoAuthors.splice(Index, 1)

                        CoAuthorReply = await message.reply({
                            embeds: [
                                new MessageEmbed()
                                    .setDescription(`Removed co-author <@${Mention.id}>`)
                                    .setColor("RED")
                                    .setFooter({text: "Message will self-destruct in 10 seconds."})
                            ],
                        })
                    } else {
                        CoAuthors.push(Mention.id)

                        CoAuthorReply = await message.reply({
                            embeds: [
                                new MessageEmbed()
                                    .setDescription(`Added co-author <@${Mention.id}>`)
                                    .setColor("GREEN")
                                    .setFooter({text: "Message will self-destruct in 10 seconds."})
                            ],
                        })
                    }
                }

                try {
                    PingCoAuthorMessage.delete()
                } catch (error) {}

                PingCoAuthorMessage = null;

                setTimeout(() => {
                    try {
                        CoAuthorReply.delete()
                    } catch (error) {}
                }, 10_000)
            } else {
                var ImportReply
                const ImportComponents = message.content.split(" - ")
                const PointValue = parseInt(ImportComponents[0])
                const Users = ImportComponents[1]

                if (typeof(PointValue) != "number") {
                    ImportReply = await message.reply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`Error: point value must be a number in the format: \`(PointValue) - @user1,@user2,...\``)
                                .setColor("RED")
                                .setFooter({text: "Message will self-destruct in 10 seconds."})
                        ]
                    })
                }

                else if (!Users) {
                    ImportReply = await message.reply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`Error: No users were provided. Users must be provided in the format: \`(PointValue) - @user1,@user2,...\``)
                                .setColor("RED")
                                .setFooter({text: "Message will self-destruct in 10 seconds."})
                        ]
                    })
                }

                else {
                    const Mentions = message.mentions.users;
                    
                    if (!ImportData[PointValue.toString()]) {
                        ImportData[PointValue.toString()] = []
                    }
                    
                    const Keys = Array.from(Mentions.keys())

                    for (const Key in Keys) {
                        const UserId = Keys[Key];

                        for (const Index in ImportData) {
                            const PointTable = ImportData[Index];
                            if (Index != PointValue && PointTable.includes(UserId)) {
                                const UserIndex = PointTable.indexOf(UserId);

                                PointTable.splice(UserIndex, 1);
                            }  else if (Index == PointValue) {
                                PointTable.push(UserId)
                            }
                        }
                    }

                    renderAttendanceEmbed();
                }

                setTimeout(() => {
                    try {
                        ImportReply.delete()
                    } catch (error) {}
                }, 10_000)
            }

            try {
                await message.delete()
            } catch (error) {}
        })

        MessageCollector.on('end', async (Collected, Signal) => {
            if (Collected.size == 0 || Signal == "CANCELLED") {
                return await Interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`Prompt cancelled or timed-out.`)
                    ],
                    components: []
                })
            }
        })
    }
}