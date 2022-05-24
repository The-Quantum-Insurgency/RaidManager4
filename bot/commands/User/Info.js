const {
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
} = require("discord.js");

async function GetDefaultEmbed(Bot) {
  const InfoEmbed = new MessageEmbed()
    .setColor("BLURPLE")
    .setTitle(`RaidManager Information Panel`)
    .setDescription(
      "The RaidManager is TQI's database interface and verification system. Commands Information Menus can be selected via the dropdown menu below."
    )
    .addField(
      "Credits",
      "imskyyc - RaidManager Framework and Discord Bot\nTeo_O781 - Command cooldown system (PELBot)\nAnthonycanada - Eval command"
    )
    .setFooter(await Bot.embedFooter(Bot));

  return InfoEmbed;
}

module.exports = {
  name: "info",
  description: "Shows bot info and credits.",

  cooldown: 30,

  execute: async function (Bot, Interaction) {
    await Interaction.deferReply({ephemeral: true});

    const Member = Interaction.member;
    const Commands = Bot.Commands;

    // Parse Commands
    const Options = [];

    await Array.from(Commands.keys()).forEach((Key) => {
      Options.push({
        label: Key,
        value: Key,
        description: `All commands pertaining to the ${Key} category.`,
      });
    });

    // Reply Setup
    const InfoSelectMenu = new MessageSelectMenu()
      .setCustomId("user.info.select")
      .setPlaceholder("Category not selected")
      .addOptions(Options);

    const InfoActionRow = new MessageActionRow().addComponents([
      InfoSelectMenu,
    ]);

    const InfoEmbed = await GetDefaultEmbed(Bot);

    try {
      const Info = await Member.send({
        embeds: [InfoEmbed],
        components: [InfoActionRow],
      });

      const Collector = Info.createMessageComponentCollector({
        componentType: "SELECT_MENU",
      });

      Collector.on("collect", async (Collected) => {
        const Parsed = [];

        const Value = Collected.values[0];
        const Category = Commands.get(Value);

        const Keys = Array.from(Category.keys());
        for (Index in Keys) {
          const Key = Keys[Index];
          const Command = Category.get(Key);

          Parsed.push({
            name: Command.name,
            description: Command.description,
            permissions: Command.permissions,
          });
        }

        const Fields = [];
        for (Index in Parsed) {
          const Command = Parsed[Index];
          const Permissions =
            (Command.permissions && Command.permissions.join(", ")) || "None";

          const FieldString = `Description - ${Command.description}\n\nPermissions - ${Permissions}\n\n`;
          Fields.push({
            name: `\`${Command.name}\``,
            value: FieldString,
          });
        }

        InfoEmbed.fields = Fields;

        try {
          await Info.edit({
            embeds: [InfoEmbed],
            components: [InfoActionRow],
          });

          await Collected.deferUpdate();
        } catch (error) {
          console.log(error);
        }
      });

      Collector.on("end", async (Collected) => {
        try {
          await Info.delete();
        } catch (error) {
          console.log(error);
        }
      });

      return Interaction.editReply({
        content: "The help menu was sent in your Direct Messages.",
        ephemeral: true,
      });
    } catch (error) {
      console.log(error);
      return Interaction.editReply({
        content:
          "I was unable to send you the help prompt due to your Direct Messages being disabled. Please enable Direct Messages from server members via the Privacy Settings menu in order to use this command.",
        ephemeral: true,
      });
    }
  },
};
