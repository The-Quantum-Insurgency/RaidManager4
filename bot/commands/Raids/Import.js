const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js")

module.exports = {
    name: "import",
    description: "Allows insurgents+ to import attendance data for a Major+ to approve.",

    permissions: ["ROLE:857447098709704736", "NODE:ADMINISTRATOR"],

    execute: async function (Bot, Interaction) {
        await Interaction.deferReply();

        const Channel = Interaction.channel;
        const Member = Interaction.member;

        var Imported = false;
        var CoAuthorToggle = false;
        const ImportData = {}
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
            .setDescription("Please ping the players you wish to add points to, in the format: \n(Point Amount) - @user1,@user2,@user3,...\n\nExample: 2 - @imskyyc,@JustTucky,@tannibus\n\nExample 2: -2 - @imskyyc,@JustTucky,@tannibus\n\nTo add a co-author, ping them after pressing the \"Add CoAuthor\" button.\nImported data is shown below:")
            .setTimestamp()
            .setFooter({text: "Prompt will time out in 10 minutes."})

        // Re-render Attendance embed
        async function renderAttendanceEmbed() {
            const Fields = []
            
            for (const PointValue in ImportData) {
                const PointData = ImportData[PointValue];

                if (PointData && PointData.length > 0) {
                    Fields.push({
                        name: `${PointValue}`,
                        value: PointData.join(",")
                    })
                }
            }

            AttendanceEmbed.setFields(Fields);

            await Interaction.editReply({
                embeds: [AttendanceEmbed],
                components: [ConfirmationActionRow]
            })
        }

        // Send import
        async function sendImport() {
            renderAttendanceEmbed();
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

                if (!PointValue) {
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
                    
                    const PointArray = ImportData[PointValue.toString()]
                    for (const UserId in Array.from(Mentions.keys())) {
                        console.oldLog(UserId);
                        if (PointArray.includes(UserId)) {
                            const Index = PointArray.indexOf(UserId);
                            PointArray.splice(Index, 1);
                        } else {
                            PointArray.push(UserId);
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
            } else if (!Imported) {
                return sendImport()
            }
        })
    }
}