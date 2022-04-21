/**
 * @name RaidManager3
 * @author imskyyc
 */

const { MessageButton, MessageActionRow, MessageEmbed } = require("discord.js");
const UUID = require("uuid");

const ColorMap = {
  Raid: "DARK_RED",
  Training: "DARK_GREEN",
  Other: "BLURPLE",
};

const ThumbnailMap = {
  Raid: "https://cdn.imskyyc.xyz/i/0ZHaE",
  Training: "https://cdn.imskyyc.xyz/i/oOkErsMPG",
};

const ChannelMap = {
  Raid: "857449207798300702",
  Training: "857449175599415327",
  Other: "894681328337944646",
};

module.exports = {
  name: "schedule",
  description: "Lets TQI HRs schedule raids.",

  permissions: ["ROLE:857447092817756160", "ROLE:607289362165530670"],

  cooldown: 30,

  execute: async function (RaidManager, Interaction) {
    const Database = RaidManager.Database;

    const Channel = Interaction.channel;
    const Guild = Interaction.guild;
    const Member = Interaction.member;

    // Data
    let Rejected = false;
    const Event = {
      Host: Member.user.id,
      Type: null,
      Length: null,
      Date: null,
      Notes: null,
    };

    const SchedulerActionRow = new MessageActionRow();
    const CancelButton = new MessageButton()
      .setCustomId("cancel")
      .setLabel("Cancel")
      .setStyle("DANGER");

    const SchedulerEmbed = new MessageEmbed()
      .setTitle("TQI Event Scheduler")
      .setDescription(
        `Welcome <@${Member.id}>. Please select the type of event you want to host.`
      )
      .setColor("ORANGE")
      .setFooter(
        await RaidManager.EmbedFooter(
          RaidManager,
          "Prompt will time out in 30 seconds."
        )
      );

    const CatchError = async function (Error) {
      Rejected = true;

      SchedulerEmbed.setDescription(Error);
      SchedulerEmbed.setColor("RED");
      SchedulerEmbed.setFields([]);
      SchedulerEmbed.setFooter(await RaidManager.EmbedFooter(RaidManager));

      return Interaction.editReply({
        embeds: [SchedulerEmbed],
        components: [],
      });
    };

    const TypeInteraction = await new Promise(async (resolve, reject) => {
      const RaidButton = new MessageButton()
        .setCustomId("Raid")
        .setLabel("Raid")
        .setStyle("PRIMARY");

      const TrainingButton = new MessageButton()
        .setCustomId("Training")
        .setLabel("Training")
        .setStyle("PRIMARY");

      const DiscordButton = new MessageButton()
        .setCustomId("Other")
        .setLabel("Other")
        .setStyle("PRIMARY");

      SchedulerActionRow.setComponents([
        RaidButton,
        TrainingButton,
        DiscordButton,
        CancelButton,
      ]);

      const Reply = await Interaction.reply({
        embeds: [SchedulerEmbed],
        components: [SchedulerActionRow],
        fetchReply: true,
      });

      const Filter = (Interaction) => Interaction.member.id === Member.id;
      const Collector = Reply.createMessageComponentCollector({
        filter: Filter,
        time: 30_000,
        componentType: "BUTTON",
        max: 1,
        maxComponents: 1,
      });

      Collector.on("collect", (ButtonInteraction) => {
        const Cancelled = ButtonInteraction.customId === "cancel";

        try {
          ButtonInteraction.deferUpdate();
        } catch (error) {
          console.log(error);
        }

        if (Cancelled) {
          reject("Prompt cancelled.");
        } else {
          Event.Type = ButtonInteraction.customId;
          SchedulerEmbed.addField("Event Type", Event.Type, true);

          resolve();
        }
      });

      Collector.on("end", (Collected) => {
        if (Collected.size == 0) {
          reject("Prompt timed out.");
        }
      });
    }).catch(CatchError);

    if (Rejected) return;

    const LengthInteraction = await new Promise(async (resolve, reject) => {
      SchedulerEmbed.description = `Event Type has been set to ${Event.Type}. Please enter how long the event is estimated to run for (in minutes).`;

      const MessageFilter = (Message) => Message.author.id === Member.id;
      const MessageCollector = Channel.createMessageCollector({
        filter: MessageFilter,
        time: 30_000,
        max: 1,
      });

      MessageCollector.on("collect", (Message) => {
        const Length = Message.content;

        const TimeLength = parseInt(Length);
        if (!TimeLength) {
          reject("Error: Event length must be a valid number.");
        }

        if (TimeLength > 180) {
          reject("Error: Event length cannot exceed 3 hours (180 minutes).");
        }

        Event.Length = TimeLength.toString();
        SchedulerEmbed.addField(
          "Event Length",
          `${Event.Length} minutes`,
          true
        );

        try {
          Message.delete();
        } catch (error) {
          console.log(error);
        }

        resolve();
      });

      MessageCollector.on("end", (Collected) => {
        if (Collected.size == 0) {
          reject("Prompt timed out.");
        }
      });

      SchedulerActionRow.setComponents([CancelButton]);
      const Reply = await Interaction.editReply({
        embeds: [SchedulerEmbed],
        components: [SchedulerActionRow],
        fetchReply: true,
      });

      const InteractionFilter = (Interaction) =>
        Interaction.member.id === Member.id;
      const InteractionCollector = Reply.createMessageComponentCollector({
        filter: InteractionFilter,
        time: 30_000,
        componentType: "BUTTON",
        max: 1,
        maxComponents: 1,
      });

      InteractionCollector.on("collect", (ButtonInteraction) => {
        const Cancelled = ButtonInteraction.customId === "cancel";

        if (Cancelled) {
          reject("Prompt cancelled.");
        }
      });
    }).catch(CatchError);

    if (Rejected) return;

    const TimeInteraction = await new Promise(async (resolve, reject) => {
      SchedulerEmbed.description = `Event Length has been set to ${Event.Length} minutes. Please enter the date of the event. **The date must be a UNIX timestamp, which can be obtained here:** https://www.unixtimestamp.com/\nUnder "Enter Date and Time", the date you enter is **your local time**. The UNIX timestamp will be provided below.`;
      SchedulerEmbed.setFooter(
        await RaidManager.EmbedFooter(
          RaidManager,
          "Prompt will time out in 60 seconds."
        )
      );

      const MessageFilter = (Message) => Message.author.id === Member.id;
      const MessageCollector = Channel.createMessageCollector({
        filter: MessageFilter,
        time: 60_000,
        max: 1,
      });

      MessageCollector.on("collect", async (Message) => {
        const Time = Message.content;

        if (!parseInt(Time)) {
          return reject("Error: Event date must be a number (UNIX Timestamp).");
        }

        const Epoch = await parseInt(Time);
        const DateNow = new Date().getTime() / 1000;

        if (DateNow >= Epoch) {
          return reject(`Error: Event date must be in the future.`);
        }

        Event.Date = Time;
        SchedulerEmbed.addField(
          "Event Date",
          `<t:${Event.Date}> (${Event.Date})`,
          true
        );

        try {
          Message.delete();
        } catch (error) {
          console.log(error);
        }

        resolve();
      });

      MessageCollector.on("end", (Collected) => {
        if (Collected.size == 0) {
          reject("Prompt timed out.");
        }
      });

      SchedulerActionRow.setComponents([CancelButton]);
      const Reply = await Interaction.editReply({
        embeds: [SchedulerEmbed],
        components: [SchedulerActionRow],
        fetchReply: true,
      });

      const InteractionFilter = (Interaction) =>
        Interaction.member.id === Member.id;
      const InteractionCollector = Reply.createMessageComponentCollector({
        filter: InteractionFilter,
        time: 30_000,
        componentType: "BUTTON",
        max: 1,
        maxComponents: 1,
      });

      InteractionCollector.on("collect", (ButtonInteraction) => {
        const Cancelled = ButtonInteraction.customId === "cancel";

        if (Cancelled) {
          reject("Prompt cancelled.");
        }
      });
    }).catch(CatchError);

    if (Rejected) return;

    const NotesInteraction = await new Promise(async (resolve, reject) => {
      let InteractionCollector = null;
      const SkipButton = new MessageButton()
        .setCustomId("skip")
        .setLabel("Skip")
        .setStyle("PRIMARY");
      SchedulerEmbed.description = `Event Date has been set to <t:${Event.Date}> (${Event.Date}). Please enter any extra notes you have for this event. (One message only).`;

      const MessageFilter = (Message) => Message.author.id === Member.id;
      const MessageCollector = Channel.createMessageCollector({
        filter: MessageFilter,
        time: 30_000,
        max: 1,
      });

      MessageCollector.on("collect", (Message) => {
        let Notes = Message.content;

        if (Notes.length > 200) {
          Notes = Notes.substring(0, 200) + "...";
        }

        Event.Notes = Notes;
        SchedulerEmbed.addField("Event Notes", Event.Notes, true);

        try {
          Message.delete();
        } catch (error) {
          console.log(error);
        }

        if (InteractionCollector) {
          try {
            InteractionCollector.stop();
          } catch (error) {
            return CatchError(error);
          }
        }

        resolve();
      });

      MessageCollector.on("end", (Collected) => {
        if (Collected.size == 0) {
          reject("Prompt timed out.");
        }
      });

      SchedulerActionRow.setComponents([SkipButton, CancelButton]);
      const Reply = await Interaction.editReply({
        embeds: [SchedulerEmbed],
        components: [SchedulerActionRow],
        fetchReply: true,
      });

      const InteractionFilter = (Interaction) =>
        Interaction.member.id === Member.id;
      InteractionCollector = Reply.createMessageComponentCollector({
        filter: InteractionFilter,
        time: 30_000,
        componentType: "BUTTON",
        max: 1,
        maxComponents: 1,
      });

      InteractionCollector.on("collect", (ButtonInteraction) => {
        const Cancelled = ButtonInteraction.customId === "cancel";

        try {
          ButtonInteraction.deferUpdate();
        } catch (error) {
          return CatchError(error);
        }

        if (Cancelled) {
          reject("Prompt cancelled.");
        } else {
          console.log("none");
          Event.Notes = "None";
          SchedulerEmbed.addField("Event Notes", Event.Notes, true);

          resolve();
        }
      });
    }).catch(CatchError);

    if (Rejected) return;

    const SubmitButton = new MessageButton()
      .setCustomId("submit")
      .setLabel("Submit")
      .setStyle("SUCCESS");

    SchedulerActionRow.setComponents([SubmitButton, CancelButton]);
    SchedulerEmbed.setDescription(
      "Event creation is complete. If you would like to finalize this event, and upload it to the events schedule, please press Submit. If not, you may cancel the prompt."
    );
    const Reply = await Interaction.editReply({
      embeds: [SchedulerEmbed],
      components: [SchedulerActionRow],
      fetchReply: true,
    });

    const InteractionFilter = (Interaction) =>
      Interaction.member.id === Member.id;
    const InteractionCollector = Reply.createMessageComponentCollector({
      filter: InteractionFilter,
      time: 60_000,
      componentType: "BUTTON",
      max: 1,
      maxComponents: 1,
    });

    InteractionCollector.on("collect", async (ButtonInteraction) => {
      const Cancelled = ButtonInteraction.customId === "cancel";

      if (Cancelled) {
        CatchError("Prompt cancelled.");
      } else {
        const Id = UUID.v4();
        Event.Id = Id;
        SchedulerEmbed.setDescription(
          "Scheduling complete. Your event will now be visible on the event schedule."
        );
        SchedulerEmbed.setColor("GREEN");
        SchedulerEmbed.setFooter(await RaidManager.EmbedFooter(RaidManager));

        try {
          const InterestedButton = new MessageButton()
            .setLabel("Interested")
            .setCustomId(`interested/${Id}`)
            .setStyle("PRIMARY");

          const InterestedActionRow = new MessageActionRow().setComponents([
            InterestedButton,
          ]);

          const EventEmbed = new MessageEmbed()
            .setTitle(`${Event.Type}`)
            .setDescription(
              `A new ${Event.Type.toLowerCase()} event has been created. Information:`
            )
            .addField("Event Id", `\`${Id}\``)
            .addField("Host", `<@${Event.Host}>`, true)
            .addField("Type", `${Event.Type}`, true)
            .addField("Length (minutes)", `${Event.Length}`)
            .addField("Date (Your local time)", `<t:${Event.Date}>`, true)
            .addField("Notes", `${Event.Notes}`, true)
            .setColor(ColorMap[Event.Type]);

          if (ThumbnailMap[Event.Type]) {
            EventEmbed.setThumbnail(ThumbnailMap[Event.Type]);
          }

          const ChannelId = ChannelMap[Event.Type];
          const NotificationChannel = await Guild.channels.resolve(ChannelId);

          if (NotificationChannel) {
            const AnnouncementMessage = await NotificationChannel.send({
              embeds: [EventEmbed],
              components: [InterestedActionRow],
            });

            Event.AnnouncementId = AnnouncementMessage.id;
          }
        } catch (error) {
          SchedulerEmbed.setColor("ORANGE");
          SchedulerEmbed.setDescription(
            "Scheduling was successfully completed, however, the event notification could not be pushed to the specified event channel. Please contact a guild administrator for assistance."
          );

          console.log(error);
        }

        const Scheduled = await Database.CreateEvent(Event);

        if (!Scheduled) {
          return CatchError(`Error: Event failed to create.`);
        }

        SchedulerEmbed.addField(
          "Event Id",
          `\`${Id}\`; Use this ID when altering, deleting, or starting the event.`
        );

        return Interaction.editReply({
          embeds: [SchedulerEmbed],
          components: [],
        });
      }
    });

    InteractionCollector.on("end", (Collected) => {
      if (Collected.size == 0) {
        CatchError("Prompt timed out.");
      }
    });
  },
};
