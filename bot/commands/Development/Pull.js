const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const { exec } = require("child_process");

module.exports = {
  name: "pull",
  description: "Pulls the most recent version of the RaidManager from Git.",

  developer: true,

  permissions: ["NODE:ADMINISTRATOR"],

  execute: async function (RaidManager, Interaction) {
    const Member = Interaction.member;

    const ConfirmationEmbed = new MessageEmbed()
      .setTitle("Pull Confirmation")
      .setDescription(
        "Please confirm you want to pull the most recent commit from GitHub. (**WARNING: THIS COMMAND CAN DE-SYNC THE RAIDMANAGER SERVER AND LOCAL REPOSITORIES. RUN ONLY IF NECESSARY.**)"
      )
      .setColor("ORANGE")
      .setFooter(
        await RaidManager.EmbedFooter(
          RaidManager,
          "Prompt will time out in 15 seconds."
        )
      );

    const PullButton = new MessageButton()
      .setStyle("DANGER")
      .setLabel("Pull")
      .setCustomId("true");

    const CancelButton = new MessageButton()
      .setStyle("SECONDARY")
      .setLabel("Cancel")
      .setCustomId("false");

    const ConfirmationActionRow = new MessageActionRow().setComponents([
      PullButton,
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
          .setDescription("Pulling from GitHub. Please wait...")
          .setFooter("");

        await Interaction.editReply({
          embeds: [ConfirmationEmbed],
          components: [],
        });

        await exec("git pull", (error, stdout, stderr) => {
          if (error) {
            ConfirmationEmbed.setColor("RED")
              .setDescription("Git Pull failed. Error attached below.")
              .setFooter("");

            return Interaction.editReply({
              embeds: [ConfirmationEmbed],
              files: [
                {
                  attachment: Buffer.from(error),
                  name: "error.js",
                },
              ],
            });
          } else {
            console.log(stdout.trim());
            ConfirmationEmbed.setColor("GREEN").setFooter("");

            if (stdout.trim() == "Already up to date.") {
              ConfirmationEmbed.setDescription(
                "RaidManager is up to date with git repository."
              );
            } else {
              ConfirmationEmbed.setDescription(
                "RaidManager has been updated successfully. Restart recommended."
              );
            }

            return Interaction.editReply({
              embeds: [ConfirmationEmbed],
            });
          }
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
