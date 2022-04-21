const {
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  Channel,
} = require("discord.js");

module.exports = {
  name: "pingembed",
  description: "Sends a ping toggle embed in the current channel.",

  permissions: [],

  cooldown: 30,

  execute: async function (RaidManager, Interaction) {
    const Channel = Interaction.channel;

    const ToggleEmbed = new MessageEmbed()
      .setTitle("Event Ping Toggler")
      .setDescription("Select the pings you want to enable / disable below.")
      .setFooter(await RaidManager.EmbedFooter(RaidManager))
      .setColor("BLURPLE");

    const RaidButton = new MessageButton()
      .setStyle("DANGER")
      .setLabel("Raid Pings")
      .setEmoji("⚔️")
      .setCustomId("pingtoggle/raid");

    const TrainingButton = new MessageButton()
      .setStyle("PRIMARY")
      .setLabel("Training Pings")
      .setEmoji("✅")
      .setCustomId("pingtoggle/training");

    const ToggleActionRow = new MessageActionRow().setComponents([
      RaidButton,
      TrainingButton,
    ]);

    try {
      await Channel.send({
        embeds: [ToggleEmbed],
        components: [ToggleActionRow],
      });

      await Interaction.reply({
        content: "Toggler prompt successfully sent.",
        ephemeral: true,
      });
    } catch (error) {}
  },
};
