const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

module.exports = {
  name: "pingembed",
  description: "Lets guild administrators send a ping toggler embed in this channel.",

  execute: async function (Bot, Interaction) {
    await Interaction.deferReply({
      ephemeral: true
    })
    const Channel = Interaction.channel;

    const RaidButton = new MessageButton()
      .setStyle("DANGER")
      .setLabel("Raid Pings")
      .setEmoji("⚔️")
      .setCustomId("pingtoggle/raid");

    const TrainingButton = new MessageButton()
      .setStyle("PRIMARY")
      .setLabel("Training Pings")
      .setEmoji("✅")
      .setCustomId("pingtoggle/training")

    try {
      await Channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle("Event Ping Toggler")
            .setDescription("Select the pings you want to enable / disable below.")
            .setColor("BLURPLE")
        ],

        components: [
          new MessageActionRow()
            .setComponents([
              RaidButton,
              TrainingButton
            ])
        ]
      })

      await Interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setDescription(`Toggler prompt successfully sent.`)
            .setColor("GREEN")
        ],

        ephemeral: true
      })
    } catch (error) {
      await Interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setDescription(`Error sending embed. \`${error}\``)
            .setColor("RED")
        ],

        ephemeral: true
      })
    }
  },
};
