const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { getIdFromUsername, getPlayerInfo, getPlayerThumbnail, getBlurb } = require('noblox.js');

module.exports = {
    name: "verify",
    description: "Lets users verify with RaidManager.",

    cooldown: 60,

    execute: async function (Bot, Interaction) {
        await Interaction.deferReply();
        
        const Database = Bot.database;
        const Member = Interaction.member;
        const Channel = Interaction.channel;
        const Guild = Interaction.guild;

        const UserData = await Database.getUser(Member.id);

        // Message componenets
        const ConfirmButton = new MessageButton()
            .setCustomId("true")
            .setLabel("Confirm")
            .setStyle("DANGER")

        const CancelButton = new MessageButton()
            .setCustomId("false")
            .setLabel("Cancel")
            .setStyle("SECONDARY")

        // Verification process
        if (UserData) {
            try {
                await new Promise(async (resolve, reject) => {
                    const ResponseActionRow = new MessageActionRow().addComponents([ConfirmButton, CancelButton]);
                    const CollectionFilter = (ButtonInteraction) => ButtonInteraction.member.id === Member.id;

                    const Reply = await Interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setColor("RED")
                                .setTitle("RaidManager Re-Verification")
                                .setDescription("You are already verified in the RaidManager database. If you would like to update your roles, run /update. Your data **will** be preserved whilst reverifying, but it is encouraged to run /mydata so there's a record of your prior data. Are you sure you want to re-verify?")
                                .setFooter({text: "Prompt will time out in 30 seconds."})
                                .setTimestamp()
                        ],
                        components: [ResponseActionRow]
                    })

                    const InteractionCollector = Reply.createMessageComponentCollector({
                        filter: CollectionFilter,
                        componentType: "BUTTON",
                        max: 1,
                        maxComponents: 1,
                        maxUsers: 1,
                        time: 30_000,
                    });

                    InteractionCollector.on('collect', async ButtonInteraction => {
                        try {
                            await ButtonInteraction.deferUpdate();
                        } catch (error) {}

                        if (ButtonInteraction.customId == "true") {
                            resolve();
                        } else {
                            reject();
                        }
                    })

                    InteractionCollector.on('end', Collected => {
                        if (Collected.size == 0) {
                            reject();
                        }
                    })
                })
            } catch (error) {
                return await Interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`Prompt cancelled or timed-out. ${error || ""}`)
                    ],

                    components: []
                })
            }
        }

        const MessageCollectionFilter = (Message) => Message.author.id == Member.id;
        const InteractionCollectionFilter = (Interaction) => Interaction.member.id == Member.id

        // Username & UserId collection
        var Username = "";
        var UserId = 0;
        var PlayerInfo = null;
        var PlayerThumbnail = "";
        var VerificationCode = "";
        var UserdataConfirmed = false;

        while (!UserdataConfirmed) {
            try {
                await new Promise(async (resolve, reject) => {
                    const Reply = await Interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("RaidManager Verification")
                                .setDescription(`Welcome to ${Guild.name}. This guild uses the RaidManager verification system to verify the identities of its members. To begin the verification process, please type your username in this channel. If you would like to cancel verification at any point, press the cancel button.`)
                                .setColor("ORANGE")
                                .setFooter({text: "Prompt will time out in 60 seconds."})
                                .setTimestamp()
                        ],
            
                        components: [
                            new MessageActionRow()
                                .setComponents([CancelButton])
                        ],

                        fetchReply: true
                    })

                    const MessageCollector = await Channel.createMessageCollector({
                        filter: MessageCollectionFilter,
                        max: 1,
                        time: 60_000,
                    })
    
                    MessageCollector.on('collect', Message => {
                        Username = Message.content;

                        try {
                            Message.delete()
                        } catch (error) {}

                        resolve();
                    })
    
                    MessageCollector.on('end', (Collected, Signal) => {
                        if (Collected.size == 0 && Signal != "CANCELLED") {
                            reject();
                        }
                    })

                    const InteractionCollector = Reply.createMessageComponentCollector({
                        filter: InteractionCollectionFilter,
                        componentType: "BUTTON",
                        max: 1,
                        maxComponents: 1,
                        maxUsers: 1,
                        time: 30_000,
                    });
            
                    InteractionCollector.on('collect', async ButtonInteraction => {
                        try {
                            await ButtonInteraction.deferUpdate();
                        } catch (error) {}

                        MessageCollector.stop("CANCELLED")
    
                        reject();
                    })
                })
            } catch (error) {
                await Interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`Prompt cancelled or timed-out. ${error || ""}`)
                    ],
    
                    components: []
                })

                break;
            }

            try {
                await new Promise(async (resolve, reject) => {
                    try {
                        UserId = await getIdFromUsername(Username);
                    } catch (error) {
                        return resolve();
                    }
                    
                    try {
                        PlayerInfo = await getPlayerInfo(UserId);
                    } catch (error) {
                        return resolve();
                    }

                    UserdataConfirmed = true;

                    resolve();
                })
            } catch (error) {
                if (error) {
                    await Interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`Error: ${error}. Please enter your username again.`)
                        ]
                    })

                    continue;
                } else {
                    await Interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`Prompt cancelled or timed-out.`)
                        ],
        
                        components: []
                    })
    
                    break;
                }
            }
        }

        if (!UserdataConfirmed) return;
        UserdataConfirmed = false;

        // Verify that the user owns the account
        try {
            await new Promise(async (resolve, reject) => {
                PlayerThumbnail = (await getPlayerThumbnail(UserId, "420x420"))[0].imageUrl;
                ConfirmButton.setStyle("SUCCESS");

                const Reply = await Interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("RaidManager Verification")
                            .setDescription(`Showing userdata for ${PlayerInfo.username}. (${UserId}). If you believe this account belongs to you, press confirm.`)
                            .setColor("ORANGE")
                            .setFooter({text: "Prompt will time out in 60 seconds."})
                            .setTimestamp()
                            .setThumbnail(PlayerThumbnail)
                            .addFields([
                                {
                                    name: "Username",
                                    value: PlayerInfo.username || 'Unknown',
                                    inline: true
                                },
                                {
                                    name: "Account Age",
                                    value: `${PlayerInfo.age} days`,
                                    inline: true
                                },
                                {
                                    name: "Bio (Blurb)",
                                    value: PlayerInfo.blurb || '--Empty--',
                                    inline: false
                                }
                            ])
                    ],
        
                    components: [
                        new MessageActionRow()
                            .setComponents([ConfirmButton, CancelButton])
                    ],
        
                    fetchReply: true
                })
        
                const InteractionCollector = Reply.createMessageComponentCollector({
                    filter: InteractionCollectionFilter,
                    componentType: "BUTTON",
                    max: 1,
                    maxComponents: 1,
                    maxUsers: 1,
                    time: 30_000,
                });
        
                InteractionCollector.on('collect', async ButtonInteraction => {
                    try {
                        await ButtonInteraction.deferUpdate();
                    } catch (error) {}

                    if (ButtonInteraction.customId == "true") {
                        UserdataConfirmed = true;
                        
                        resolve();
                    } else {
                        reject();
                    }
                })
        
                InteractionCollector.on('end', Collected => {
                    if (Collected.size == 0) {
                        reject();
                    }
                })
            })
        } catch (error) {
            if (error) {
                return await Interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`An error occurred whilst handling the request. Error: ${error}`)
                    ],
    
                    components: []
                })
            } else {
                return await Interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`Prompt cancelled or timed-out.`)
                    ],
    
                    components: []
                })
            }
        }

        if (!UserdataConfirmed) return;
        UserdataConfirmed = false;

        // Generate verification code function
        function getRandomIntInclusive(min, max) {
            // Mozilla docs <3
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
        }

        function generateVerificationCode(length = getRandomIntInclusive(5, 10)) {
            const VerificationWords = [];
            const Words = [
                "red",
                "orange",
                "yellow",
                "green",
                "blue",
                "purple",
                "teal",
                "pink"
            ]

            for (let i = 0; i < length; i++) {
                const Word = Words[Math.floor(Math.random() * Words.length)];
                VerificationWords.push(Word);
            }

            return VerificationWords.join(" ");
        }
        
        while (!UserdataConfirmed) {
            try {
                ConfirmButton.setStyle("SUCCESS");
                const RegenCodeButton = new MessageButton()
                    .setCustomId("regen")
                    .setLabel("Regenerate code")
                    .setStyle("DANGER");

                await new Promise(async (resolve, reject) => {
                    VerificationCode = generateVerificationCode()

                    const Reply = await Interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("RaidManager Verification")
                                .setDescription("Please enter the following code in your bio / blurb. (Your \"About Me\" section)")
                                .setThumbnail(PlayerThumbnail)
                                .setFooter({text: "Prompt times out in 3 minutes."})
                                .setTimestamp()
                                .setColor("ORANGE")
                                .addFields([
                                    {
                                        name: "Verification Code",
                                        value: VerificationCode,
                                        inline: true
                                    }
                                ])
                        ],

                        components: [
                            new MessageActionRow().addComponents([ConfirmButton, RegenCodeButton, CancelButton])
                        ],

                        fetchReply: true
                    })

                    const InteractionCollector = Reply.createMessageComponentCollector({
                        filter: InteractionCollectionFilter,
                        componentType: "BUTTON",
                        max: 1,
                        maxComponents: 1,
                        maxUsers: 1,
                        time: 180_000,
                    });
            
                    InteractionCollector.on('collect', async ButtonInteraction => {
                        try {
                            await ButtonInteraction.deferUpdate();
                        } catch (error) {}

                        switch (ButtonInteraction.customId) {
                            case "true":
                                UserdataConfirmed = true;
                                
                                resolve();

                                break;
                            case "regen":
                                resolve();

                                break;
                            default:
                                reject();

                                break;
                        }

                        if (ButtonInteraction.customId == "true") {
                            UserdataConfirmed = true;
                            
                            resolve();
                        } else {
                            reject();
                        }
                    })
            
                    InteractionCollector.on('end', Collected => {
                        if (Collected.size == 0) {
                            reject();
                        }
                    })
                });
            } catch (error) {
                if (error) {
                    await Interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`An error occurred whilst handling the request. Error: ${error}`)
                        ],
        
                        components: []
                    })
                } else {
                    await Interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`Prompt cancelled or timed-out.`)
                        ],
        
                        components: []
                    })
                }

                break;
            }
        }

        if (!UserdataConfirmed) return;

        // Check user's profile for code in blurb
        await Interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setTitle("RaidManager Verification")
                    .setDescription("Checking for code in blurb. This may take some time..")
            ],

            components: []
        })

        var UserBlurb = "";

        try {
            UserBlurb = await getBlurb(UserId)
        } catch (error) {
            return await Interaction.editReply({
                content: `An internal error occurred whilst fetching the player's blurb. Error: ${error}`,
                embeds: [],
                components: [],
            })
        }

        if (UserBlurb.includes(VerificationCode)) {
            await Database.setUser(Member.id, {
                roblox_id: UserId
            })

            return await Interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("RaidManager Verification")
                        .setDescription("Success! Your account has been verified. Please run /update to obtain your roles.")
                        .setColor("GREEN")
                        .setTimestamp()
                ],
                
                components: []
            });
        } else {
            return await Interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("RaidManager Verification")
                        .setDescription("Verification has failed due to the verification code not being present in the user's blurb. Please try again.")
                        .setColor("RED")
                        .setTimestamp()
                ],
                
                components: []
            });
        }
    }
}
