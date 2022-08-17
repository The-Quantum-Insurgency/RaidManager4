const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const FileSystem = require("fs/promises");

module.exports = {
  name: "reboot",
  description: "Reboots the bot.",

  developer: false,

  permissions: ["NODE:ADMINISTRATOR"],

  execute: async function (RaidManager, Interaction) {
    const Member = Interaction.member;
    const Guild = Interaction.guild;
    const Channel = Interaction.channel;

    const ConfirmationEmbed = new MessageEmbed()
      .setTitle("Reboot Confirmation")
      .setDescription(
        "Please confirm you want to reboot the bot. (WARNING: This will cancel any and all verification prompts, and could lead to data sync issues if hosts are actively editing events. **Use this command with caution!**"
      )
      .setColor("ORANGE")
      .setFooter(
        await RaidManager.embedFooter(
          RaidManager,
          "Prompt will time out in 15 seconds."
        )
      );

    const RebootButton = new MessageButton()
      .setStyle("DANGER")
      .setLabel("Reboot")
      .setCustomId("true");

    const CancelButton = new MessageButton()
      .setStyle("SECONDARY")
      .setLabel("Cancel")
      .setCustomId("false");

    const ConfirmationActionRow = new MessageActionRow().setComponents([
      RebootButton,
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
          .setDescription("Rebooting. Please wait...")
          .setFooter("");

        await Interaction.editReply({
          embeds: [ConfirmationEmbed],
          components: [],
        });

        // const Configuration = RaidManager.Configuration;
        // const ShutdownData = Configuration.shutdown_data;

        // ShutdownData.guild_id = Guild.id;
        // ShutdownData.channel_id = Channel.id;
        // ShutdownData.message_id = Reply.id;

        // const ConfigString = JSON.stringify(Configuration, null, 4);

        // try {
        //   await FileSystem.writeFile(
        //     "Configuration/Bot/config.json",
        //     ConfigString
        //   );
        // } catch (error) {
        //   ConfirmationEmbed.setColor("RED")
        //     .setDescription(
        //       "config.json could NOT be written to. Reboot cancelled. See bot logs for more details."
        //     )
        //     .setFooter("");

        //   return Interaction.editReply({
        //     embeds: [ConfirmationEmbed],
        //   });
        // }

        // process.exit(2);
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
