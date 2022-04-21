const { SlashCommandStringOption } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

const ColorMap = {
  Raid: "DARK_RED",
  Training: "DARK_GREEN",
  Other: "BLURPLE",
};

const ThumbnailMap = {
  Raid: "https://cdn.imskyyc.xyz/YDkF",
  Training: "http://cdn.imskyyc.xyz/fL9b",
};

module.exports = {
  name: "events",
  description: "Shows a list of evens on the event schedule.",

  options: [
    new SlashCommandStringOption()
      .setName("type")
      .setDescription("Search for a specific type of event.")
      .setRequired(false),
  ],

  execute: async function (RaidManager, Interaction) {
    const Database = RaidManager.Database;
    const Arguments = Interaction.options;

    const EventType =
      (Arguments.get("type") && Arguments.get("type").value) || "All";

    const SearchEmbed = new MessageEmbed()
      .setTitle("TQI Event Schedule")
      .setDescription(`Searching for events matching the type ${EventType}.`)
      .setColor("ORANGE");

    await Interaction.reply({
      embeds: [SearchEmbed],
    });

    const Events = await Database.GetEvents(EventType, 10);
    const Embeds = [];

    if (Events.length == 0) {
      SearchEmbed.setDescription(
        `No events found matching the type ${EventType}`
      );
      SearchEmbed.setColor("RED");

      return Interaction.editReply({
        embeds: [SearchEmbed],
      });
    }

    for (Index in Events) {
      const Event = Events[Index];

      const Embed = new MessageEmbed()
        .setTitle(`${Event.type}`)
        .addField("ID", `${Event.id}`, true)
        .addField("Host", `<@${Event.host}>`, true)
        .addField("Type", `${Event.type}`, true)
        .addField("Length (minutes)", `${Event.length}`)
        .addField("Date (Your local time)", `<t:${Event.date}>`, true)
        .addField("Notes", `${Event.notes}`, true)
        .setColor(ColorMap[Event.type]);

      if (ThumbnailMap[Event.type]) {
        Embed.setThumbnail(ThumbnailMap[Event.type]);
      }

      Embeds.push(Embed);
    }

    return Interaction.editReply({
      content: `Found ${Events.length} events matching type ${EventType}:`,
      embeds: Embeds,
    });
  },
};
