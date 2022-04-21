const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const FileSystem = require("fs/promises");

module.exports = {
  name: "reload",
  description: "Reloads bot commands and event listeners.",

  developer: false,

  permissions: ["NODE:ADMINISTRATOR"],

  execute: async function (RaidManager, Interaction) {
    const Member = Interaction.member;

    const ConfirmationEmbed = new MessageEmbed()
      .setTitle("Reload Confirmation")
      .setDescription(
        "Please confirm you want to reload the bot. This will reload all commands and event listeners."
      )
      .setColor("ORANGE")
      .setFooter(
        await RaidManager.EmbedFooter(
          RaidManager,
          "Prompt will time out in 15 seconds."
        )
      );

    const ReloadButton = new MessageButton()
      .setStyle("DANGER")
      .setLabel("Reload")
      .setCustomId("true");

    const CancelButton = new MessageButton()
      .setStyle("SECONDARY")
      .setLabel("Cancel")
      .setCustomId("false");

    const ConfirmationActionRow = new MessageActionRow().setComponents([
      ReloadButton,
      CancelButton,
    ]);

    const Reply = await Interaction.reply({
      embeds: [ConfirmationEmbed],
      components: [ConfirmationActionRow],
      fetchReply: true,
    });

    const CollectionFilter = (Interaction) =>
      Interaction.member.id === Member.id;
    const Collector = Reply.createMessageComponentCollector({
      filter: CollectionFilter,
      time: 15_000,
      componentType: "BUTTON",
      max: 1,
      maxComponents: 1,
    });

    Collector.on("collect", async (ButtonInteraction) => {
      const Cancelled = ButtonInteraction.customid === "false";

      if (Cancelled) {
        ConfirmationEmbed.setColor("RED")
          .setDescription("Prompt cancelled.")
          .setFooter("");

        return Interaction.editReply({
          embeds: [ConfirmationEmbed],
          components: [],
        });
      } else {
        ConfirmationEmbed.setColor("YELLOW")
          .setDescription("Reloading. Please wait...")
          .setFooter("");

        await Interaction.editReply({
          embeds: [ConfirmationEmbed],
          components: [],
        });

        await RaidManager.LoadBot(true);

        ConfirmationEmbed.setColor("GREEN")
          .setDescription("Reload complete.")
          .setFooter("");

        return Interaction.editReply({
          embeds: [ConfirmationEmbed],
        });
      }
    });

    Collector.on("end", async (Collected) => {
      if (Collected.size == 0) {
        ConfirmationEmbed.setColor("RED")
          .setDescription("Prompt timed out")
          .setFooter("");

        return Interaction.editReply({
          embeds: [ConfirmationEmbed],
          components: [],
        });
      }
    });
  },
};
