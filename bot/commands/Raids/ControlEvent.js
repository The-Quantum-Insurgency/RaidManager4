const { SlashCommandStringOption } = require("@discordjs/builders");
const { MessageActionRow, MessageButton } = require("discord.js");
const { MessageEmbed } = require("discord.js");

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
  name: "controlevent",
  description: "Allows event hosts to modify one of their scheduled events.",
  options: [
    new SlashCommandStringOption()
      .setName("id")
      .setDescription("The ID of the event to control.")
      .setRequired(true),
  ],

  permissions: ["ROLE:857447092817756160", "ROLE:607289362165530670"],

  execute: async function (RaidManager, CommandInteraction) {
    const Database = RaidManager.Database;
    const Arguments = CommandInteraction.options;
    const Member = CommandInteraction.member;
    const Channel = CommandInteraction.channel;
    const Guild = CommandInteraction.guild;

    const EventId = Arguments.get("id").value;

    const ControlEmbed = new MessageEmbed()
      .setTitle("Event Control Panel")
      .setDescription(`Searching for events matching ID \`${EventId}\``)
      .setColor("ORANGE");

    await CommandInteraction.reply({
      embeds: [ControlEmbed],
    });

    const Event = await Database.GetEvent(EventId);
    if (Event) {
      if (Event.host != Member.id && !Member.permissions.has("ADMINISTRATOR")) {
        ControlEmbed.setDescription(
          `You do not have permission to modify event \`${EventId}\`. Please contact the event host to have them update it.`
        );
        ControlEmbed.setColor("RED");

        return CommandInteraction.editReply({
          embeds: [ControlEmbed],
        });
      }

      const Interested = JSON.parse(Event.interested);
      const AnnouncementId = Event.announcement_id;
      const AnnouncementChannelId = ChannelMap[Event.type];
      const AnnouncementChannel = await Guild.channels.resolve(
        AnnouncementChannelId
      );
      var AnnouncementMessage;

      try {
        AnnouncementMessage = await AnnouncementChannel.messages.fetch(
          AnnouncementId
        );
      } catch (error) {
        console.log(error);
      }

      const EventTypeButton = new MessageButton()
        .setLabel("Event Type")
        .setStyle("PRIMARY")
        .setCustomId("type");

      const EventLengthButton = new MessageButton()
        .setLabel("Event Length")
        .setStyle("PRIMARY")
        .setCustomId("length");

      const EventDateButton = new MessageButton()
        .setLabel("Event Date")
        .setStyle("PRIMARY")
        .setCustomId("date");

      const EventNotesButton = new MessageButton()
        .setLabel("Event Notes")
        .setStyle("PRIMARY")
        .setCustomId("notes");

      const ViewInterestedButton = new MessageButton()
        .setLabel("View Interested")
        .setStyle("PRIMARY")
        .setCustomId("view");

      const DelayEventButton = new MessageButton()
        .setLabel("Delay Event")
        .setStyle("DANGER")
        .setCustomId("delay");

      const TransferHostButton = new MessageButton()
        .setLabel("Transfer Host")
        .setStyle("DANGER")
        .setCustomId("host");

      const CancelEventButton = new MessageButton()
        .setLabel("Cancel Event")
        .setStyle("DANGER")
        .setCustomId("cancel");

      const CancelButton = new MessageButton()
        .setLabel("Cancel Prompt")
        .setStyle("DANGER")
        .setCustomId("kill");

      const StartEventButton = new MessageButton()
        .setLabel("Start Event")
        .setStyle("SUCCESS")
        .setCustomId("start");

      const ReminderEventButton = new MessageButton()
        .setLabel("Re-Ping For Event")
        .setStyle("SUCCESS")
        .setCustomId("ping");

      const Warning30EventButton = new MessageButton()
        .setLabel("30-Minute Warning")
        .setStyle("SUCCESS")
        .setCustomId("warning-30");

      const Warning15EventButton = new MessageButton()
        .setLabel("15-Minute Warning")
        .setStyle("SUCCESS")
        .setCustomId("warning-15");

      const EndEventButton = new MessageButton()
        .setLabel("End Event")
        .setStyle("SUCCESS")
        .setCustomId("end");

      const SubmitButton = new MessageButton()
        .setLabel("Finalize Changes")
        .setStyle("SUCCESS")
        .setCustomId("submit");

      const ControlActionRow = new MessageActionRow().setComponents([
        EventTypeButton,
        EventLengthButton,
        EventDateButton,
        EventNotesButton,
        ViewInterestedButton,
      ]);

      const EventActionRow = new MessageActionRow().setComponents([
        StartEventButton,
        ReminderEventButton,
        Warning30EventButton,
        Warning15EventButton,
        EndEventButton,
      ]);

      const DangerActionRow = new MessageActionRow().setComponents([
        DelayEventButton,
        TransferHostButton,
        CancelEventButton,
        CancelButton,
      ]);

      const SubmitActionRow = new MessageActionRow().setComponents([
        SubmitButton,
      ]);

      ControlEmbed.setDescription(
        `Showing Event Information for event \`${EventId}\`. To modify the event, please select any button from the controls below. **Note: event data and updates will not be finalized until the "Finalize Changes" button is pressed.**`
      );
      ControlEmbed.addField("Event Id", `\`${Event.id}\``);
      ControlEmbed.addField("Host", `<@${Event.host}>`, true);
      ControlEmbed.addField("Type", `${Event.type}`, true);
      ControlEmbed.addField("Length (minutes)", `${Event.length}`);
      ControlEmbed.addField(
        "Date (Your local time)",
        `<t:${Event.date}>`,
        true
      );
      ControlEmbed.addField("Notes", `${Event.notes}`, true);
      ControlEmbed.addField(
        "Interested Attendees",
        `${Interested.length}`,
        true
      );
      ControlEmbed.setColor("YELLOW");

      const Reply = await CommandInteraction.editReply({
        embeds: [ControlEmbed],
        components: [
          ControlActionRow,
          EventActionRow,
          DangerActionRow,
          SubmitActionRow,
        ],
        fetchReply: true,
      });

      let PromptActive = false;
      let ActiveMessageCollector = null;
      let ActiveInteractionCollector = null;

      const CommandFilter = (Interaction) =>
        Interaction.member.id === Member.id;
      const CommandCollector = Reply.createMessageComponentCollector({
        filter: CommandFilter,
        componentType: "BUTTON",
      });

      CommandCollector.on("collect", async (Interaction) => {
        const InteractionEmbed = new MessageEmbed();
        const InteractionActionRow = new MessageActionRow();

        if (PromptActive) {
          InteractionEmbed.setDescription(
            "Error: An event setting change prompt is already active. Please complete or cancel the previous prompt to continue."
          );
          InteractionEmbed.setColor("RED");
          return Interaction.reply({
            embeds: [InteractionEmbed],
          });
        }

        PromptActive = true;

        // Collector Functions
        async function CancelCollection() {
          PromptActive = false;

          if (ActiveInteractionCollector) {
            ActiveInteractionCollector.stop("CANCELLED");
            ActiveInteractionCollector = null;
          }

          if (ActiveMessageCollector) {
            ActiveMessageCollector.stop("CANCELLED");
            ActiveMessageCollector = null;
          }

          InteractionEmbed.setDescription("Prompt cancelled.");
          InteractionEmbed.setColor("RED");

          return Interaction.editReply({
            embeds: [InteractionEmbed],
            components: [],
          });
        }

        async function DoInteractionCollection(Limit, Callback) {
          const Filter = (Interaction) => Interaction.member.id === Member.id;
          const Reply = await Interaction.fetchReply();

          if (Reply) {
            ActiveInteractionCollector = Reply.createMessageComponentCollector({
              filter: Filter,
              componentType: "BUTTON",
              max: Limit,
              maxComponents: Limit,
            });

            ActiveInteractionCollector.on("collect", Callback);
            ActiveInteractionCollector.on("end", (Collected, Reason) => {
              if (
                Collected.size == 0 &&
                Reason != "CANCELLED" &&
                !ActiveMessageCollector
              ) {
                InteractionEmbed.setDescription("Prompt timed out.");
                InteractionEmbed.setColor("RED");
                return Interaction.editReply({
                  embeds: [InteractionEmbed],
                  components: [],
                });
              }
            });
          }
        }

        async function DoMessageCollection(Limit, Callback) {
          const Filter = (Message) => Message.author.id === Member.id;
          ActiveMessageCollector = Channel.createMessageCollector({
            filter: Filter,
            max: Limit,
          });

          ActiveMessageCollector.on("collect", Callback);
          ActiveMessageCollector.on("end", (Collected, Reason) => {
            if (Collected.size == 0 && Reason != "CANCELLED") {
              InteractionEmbed.setDescription("Prompt timed out.");
              InteractionEmbed.setColor("RED");
              return Interaction.editReply({
                embeds: [InteractionEmbed],
                components: [],
              });
            }
          });
        }

        async function PushEventUpdate(Header, Description) {
          const UpdateEmbed = new MessageEmbed()
            .setTitle(`Event Update: ${Header}`)
            .setDescription(Description);

          if (AnnouncementMessage) {
            UpdateEmbed.setURL(AnnouncementMessage?.url);
          }

          for (const Index in Interested) {
            const UserId = Interested[Index];

            const GuildMember = await Guild.members.resolve(UserId);

            if (GuildMember) {
              try {
                await GuildMember.send({
                  embeds: [UpdateEmbed],
                });
              } catch (error) {}
            }
          }
        }

        async function UpdateAnnouncementMessage() {
          const EventEmbed = new MessageEmbed()
            .setTitle(`${Event.type}`)
            .setDescription(
              `A new ${Event.type.toLowerCase()} event has been created. Information:`
            )
            .addField("Event Id", `\`${Event.id}\``)
            .addField("Host", `<@${Event.host}>`, true)
            .addField("Type", `${Event.type}`, true)
            .addField("Length (minutes)", `${Event.length}`)
            .addField("Date (Your local time)", `<t:${Event.date}>`, true)
            .addField("Notes", `${Event.notes}`, true)
            .setColor(ColorMap[Event.type]);

          if (ThumbnailMap[Event.type]) {
            EventEmbed.setThumbnail(ThumbnailMap[Event.type]);
          }

          const InterestedButton = new MessageButton()
            .setLabel("Interested")
            .setCustomId(`interested/${Event.id}`)
            .setStyle("PRIMARY");

          const InterestedActionRow = new MessageActionRow().setComponents([
            InterestedButton,
          ]);

          const ChannelId = ChannelMap[Event.type];
          const NotificationChannel = await Guild.channels.resolve(ChannelId);

          if (AnnouncementMessage) {
            try {
              await AnnouncementMessage.delete();
            } catch (error) {
              return false;
            }
          }

          if (NotificationChannel) {
            const AnnouncementMessage = await NotificationChannel.send({
              embeds: [EventEmbed],
              components: [InterestedActionRow],
            });

            Event.announcement_id = AnnouncementMessage.id;
          }

          await Database.UpdateEvent(Event);
        }

        const CustomId = Interaction.customId;
        switch (CustomId) {
          case "type": {
            InteractionEmbed.setDescription(
              `Please select the new event type.`
            );
            InteractionEmbed.setColor("ORANGE");

            const RaidButton = new MessageButton()
              .setCustomId("raid")
              .setLabel("Raid")
              .setStyle("PRIMARY");

            const TrainingButton = new MessageButton()
              .setCustomId("training")
              .setLabel("Training")
              .setStyle("PRIMARY");

            const DiscordButton = new MessageButton()
              .setCustomId("other")
              .setLabel("Other")
              .setStyle("PRIMARY");

            InteractionActionRow.setComponents([
              RaidButton,
              TrainingButton,
              DiscordButton,
              CancelButton,
            ]);

            await Interaction.reply({
              embeds: [InteractionEmbed],
              components: [InteractionActionRow],
              fetchReply: true,
            });

            DoInteractionCollection(1, (ButtonInteraction) => {
              const Cancelled = ButtonInteraction.customId === "kill";

              try {
                ButtonInteraction.deferUpdate();
              } catch (error) {
                console.log(error);
              }

              if (Cancelled) {
                return CancelCollection();
              } else {
                Event.type = ButtonInteraction.customId;

                InteractionEmbed.setDescription(
                  `Event type successfully updated to ${Event.type}`
                );
                InteractionEmbed.setColor("GREEN");

                PromptActive = false;

                return Interaction.editReply({
                  embeds: [InteractionEmbed],
                  components: [],
                });
              }
            });

            break;
          }

          case "length": {
            InteractionEmbed.setDescription(
              "Please enter the new length of the event"
            );
            InteractionEmbed.setColor("ORANGE");
            InteractionActionRow.setComponents([CancelButton]);

            await Interaction.reply({
              embeds: [InteractionEmbed],
              components: [InteractionActionRow],
            });

            DoInteractionCollection(1, CancelCollection);
            DoMessageCollection(1, async (Message) => {
              ActiveInteractionCollector.stop("CANCELLED");
              const Length = Message.content;
              const LengthInt = await parseInt(Length);

              if (!LengthInt) {
                InteractionEmbed.setDescription(
                  "Error: Event length must be a valid number."
                );
                InteractionEmbed.setColor("RED");

                return Interaction.editReply({
                  embeds: [InteractionEmbed],
                  components: [],
                });
              }

              if (LengthInt > 180) {
                InteractionEmbed.setDescription(
                  "Error: Event length cannot exceed 3 hours (180 minutes)."
                );
                InteractionEmbed.setColor("RED");

                return Interaction.editReply({
                  embeds: [InteractionEmbed],
                  components: [],
                });
              }

              Event.length = LengthInt;

              InteractionEmbed.setDescription(
                `Successfully set event length to ${Event.length}.`
              );
              InteractionEmbed.setColor("GREEN");

              PromptActive = false;
              ActiveInteractionCollector = null;
              ActiveMessageCollector = null;
              UpdateAnnouncementMessage();

              return Interaction.editReply({
                embeds: [InteractionEmbed],
                components: [],
              });
            });
            break;
          }

          case "date": {
            InteractionEmbed.setDescription(
              'Please enter the new date of the event. **The date must be a UNIX timestamp, which can be obtained here:** https://www.unixtimestamp.com/\nUnder "Enter Date and Time", the date you enter is **your local time**. The UNIX timestamp will be provided below.'
            );
            InteractionEmbed.setColor("ORANGE");
            InteractionActionRow.setComponents([CancelButton]);

            await Interaction.reply({
              embeds: [InteractionEmbed],
              components: [InteractionActionRow],
            });

            DoInteractionCollection(1, CancelCollection);
            DoMessageCollection(1, async (Message) => {
              ActiveInteractionCollector.stop("CANCELLED");

              const Time = Message.content;

              if (!parseInt(Time)) {
                InteractionEmbed.setDescription(
                  "Error: Event date must be a number (UNIX Timestamp)."
                );
                InteractionEmbed.setColor("RED");

                return Interaction.editReply({
                  embeds: [InteractionEmbed],
                  components: [],
                });
              }

              const Epoch = await parseInt(Time);
              const DateNow = new Date().getTime() / 1000;

              if (DateNow >= Epoch) {
                InteractionEmbed.setDescription(
                  "Error: Event date must be in the future."
                );
                InteractionEmbed.setColor("RED");

                return Interaction.editReply({
                  embeds: [InteractionEmbed],
                  components: [],
                });
              }

              Event.date = Time;

              InteractionEmbed.setDescription(
                `Successfully set event date to <t:${Event.date}> (${Event.date}).`
              );
              InteractionEmbed.setColor("GREEN");

              PromptActive = false;
              ActiveInteractionCollector = null;
              ActiveMessageCollector = null;
              PushEventUpdate(
                `${Event.id} rescheduled.`,
                `\`${Event.id}\` has been rescheduled to <t:${Event.date}> (Your local time).`
              );
              UpdateAnnouncementMessage();

              return Interaction.editReply({
                embeds: [InteractionEmbed],
                components: [],
              });
            });
            break;
          }

          case "notes": {
            InteractionEmbed.setDescription(
              "Please enter the new notes for the event"
            );
            InteractionEmbed.setColor("ORANGE");
            InteractionActionRow.setComponents([CancelButton]);

            await Interaction.reply({
              embeds: [InteractionEmbed],
              components: [InteractionActionRow],
            });

            DoInteractionCollection(1, CancelCollection);
            DoMessageCollection(1, async (Message) => {
              ActiveInteractionCollector.stop("CANCELLED");

              const Notes = Message.content;

              if (Notes.length > 200) {
                Notes = Notes.substring(0, 200) + "...";
              }

              Event.notes = Notes;

              InteractionEmbed.setDescription(
                `Successfully set event notes to ${Event.notes}.`
              );
              InteractionEmbed.setColor("GREEN");

              PromptActive = false;
              ActiveInteractionCollector = null;
              ActiveMessageCollector = null;
              UpdateAnnouncmentMessage();

              return Interaction.editReply({
                embeds: [InteractionEmbed],
                components: [],
              });
            });
            break;
          }

          case "view": {
            InteractionEmbed.setDescription("List of interested attendees.");
            InteractionEmbed.setColor("BLUE");

            for (const Index in Interested) {
              const UserId = Interested[Index];
              InteractionEmbed.description =
                InteractionEmbed.description + `\n<@${UserId}>`;
            }

            await Interaction.reply({
              embeds: [InteractionEmbed],
              components: [],
            });

            PromptActive = false;

            break;
          }

          case "delay": {
            InteractionEmbed.setDescription(
              "Please enter how many minutes to delay the event for."
            );
            InteractionEmbed.setColor("ORANGE");
            InteractionActionRow.setComponents([CancelButton]);

            await Interaction.reply({
              embeds: [InteractionEmbed],
              components: [InteractionActionRow],
            });

            DoInteractionCollection(1, CancelCollection);
            DoMessageCollection(1, async (Message) => {
              ActiveInteractionCollector.stop("CANCELLED");

              const Minutes = parseInt(Message.content);

              if (!Minutes) {
                InteractionEmbed.setDescription(
                  "Error: Invalid number provided."
                );
                InteractionEmbed.setColor("RED");

                return Interaction.editReply({
                  embeds: [InteractionEmbed],
                  components: [],
                });
              }

              if (Minutes <= 0) {
                InteractionEmbed.setDescription(
                  "Error: Minimum delay is one minute."
                );
                InteractionEmbed.setColor("RED");

                return Interaction.editReply({
                  embeds: [InteractionEmbed],
                  components: [],
                });
              }

              Event.date += Minutes * 60;

              InteractionEmbed.setDescription(
                `Successfully set event time to <t:${Event.date}> (${Event.date}) (${Minutes} minute increase.).`
              );
              InteractionEmbed.setColor("GREEN");

              PromptActive = false;
              ActiveInteractionCollector = null;
              ActiveMessageCollector = null;

              return Interaction.editReply({
                embeds: [InteractionEmbed],
                components: [],
              });
            });
            break;
          }

          case "host": {
            InteractionEmbed.setDescription(
              "Please ping or enter the User ID of the new host."
            );
            InteractionEmbed.setColor("ORANGE");
            InteractionActionRow.setComponents([CancelButton]);

            await Interaction.reply({
              embeds: [InteractionEmbed],
              components: [InteractionActionRow],
            });

            DoInteractionCollection(1, CancelCollection);
            DoMessageCollection(1, async (Message) => {
              const Host =
                (await Message.mentions.members.first()) ||
                Guild.members.resolve(Message.content);

              if (Host) {
                InteractionEmbed.setDescription(
                  `Are you sure you want to transfer host privileges to <@${Host.id}? **This action is irreversible unless <@${Host.id}> transfers privileges back to you.**`
                );
                InteractionEmbed.setColor("ORANGE");

                SubmitButton.label = "Confirm";
                InteractionActionRow.setComponents([
                  SubmitButton,
                  CancelButton,
                ]);

                await Interaction.editReply({
                  embeds: [InteractionEmbed],
                  components: [InteractionActionRow],
                });

                DoInteractionCollection(1, async (ButtonInteraction) => {
                  const Cancelled = ButtonInteraction.customId === "kill";

                  if (Cancelled) {
                    return CancelCollection();
                  } else {
                    Event.host = Host.id;

                    InteractionEmbed.setDescription(
                      `Host privileges have been transfered to <@${Host.id}>.`
                    );
                    InteractionEmbed.setColor("GREEN");

                    try {
                      await Reply.delete();
                    } catch (error) {
                      console.log(error);
                    }

                    await Database.UpdateEvent(Event);

                    return Interaction.editReply({
                      embeds: [InteractionEmbed],
                      components: [],
                    });
                  }
                });
              } else {
                InteractionEmbed.setDescription(
                  `User <@${Host.id}> could not be resolved.`
                );
                InteractionEmbed.setColor("RED");

                return Interaction.editReply({
                  embeds: [InteractionEmbed],
                  components: [],
                });
              }
            });

            break;
          }

          case "cancel": {
            InteractionEmbed.setDescription(
              `Are you sure you want to cancel this event? **This action is irreverisble.**`
            );
            InteractionEmbed.setColor("DARK_RED");

            SubmitButton.label = "Confirm";
            SubmitButton.style = "DANGER";
            InteractionActionRow.setComponents([SubmitButton, CancelButton]);

            await Interaction.reply({
              embeds: [InteractionEmbed],
              components: [InteractionActionRow],
            });

            DoInteractionCollection(1, async (ButtonInteraction) => {
              const Cancelled = ButtonInteraction.customId === "kill";

              if (Cancelled) {
                return CancelCollection();
              } else {
                InteractionEmbed.setDescription("Event cancelled.");
                InteractionEmbed.setColor("GREEN");

                try {
                  await Reply.delete();
                } catch (error) {
                  console.log(error);
                }

                await Database.DeleteEvent(Event.id);

                try {
                  await AnnouncementMessage.delete();
                } catch (error) {
                  console.log(error);
                }

                return Interaction.editReply({
                  embeds: [InteractionEmbed],
                  components: [],
                });
              }
            });
            break;
          }

          case "kill": {
            ControlEmbed.setDescription("Prompt cancelled.");
            ControlEmbed.setColor("RED");
            ControlEmbed.fields = [];

            CommandInteraction.editReply({
              embeds: [ControlEmbed],
              components: [],
            });

            try {
              await CommandCollector.stop();
            } catch (error) {
              console.log(error);
            }

            break;
          }

          case "start": {
            InteractionEmbed.setDescription(
              `Are you sure you want to start this event? **This will send a notification all users marked as interested.**`
            );
            InteractionEmbed.setColor("ORANGE");

            SubmitButton.setLabel("Yes");
            InteractionActionRow.setComponents([SubmitButton, CancelButton]);

            await Interaction.reply({
              embeds: [InteractionEmbed],
              components: [InteractionActionRow],
            });

            DoInteractionCollection(1, (ButtonInteraction) => {
              const Cancelled = ButtonInteraction.customId === "kill";

              if (Cancelled) {
                return CancelCollection();
              } else {
                PushEventUpdate(
                  `${Event.id} has begun.`,
                  `\`${Event.id}\` has begun. The event host may deduct credit for being late, or the server (if in-game) may be locked.`
                );
                InteractionEmbed.setDescription("Event marked as began.");
                InteractionEmbed.setColor("GREEN");

                PromptActive = false;

                return Interaction.editReply({
                  embeds: [InteractionEmbed],
                  components: [],
                });
              }
            });

            break;
          }

          case "ping": {
            InteractionEmbed.setDescription(
              `Are you sure you want to re-ping for this event? **This will send a notification all users marked as interested.**`
            );
            InteractionEmbed.setColor("ORANGE");

            SubmitButton.setLabel("Yes");
            InteractionActionRow.setComponents([SubmitButton, CancelButton]);

            await Interaction.reply({
              embeds: [InteractionEmbed],
              components: [InteractionActionRow],
            });

            DoInteractionCollection(1, (ButtonInteraction) => {
              const Cancelled = ButtonInteraction.customId === "kill";

              if (Cancelled) {
                return CancelCollection();
              } else {
                PushEventUpdate(
                  `${Event.id} reminder.`,
                  `This is a reminder that \`${Event.id}\` has begun. The event host may deduct credit for being late, or the server (if in-game) may be locked. **This message was sent by the event host.**`
                );
                InteractionEmbed.setDescription("Event re-pinged..");
                InteractionEmbed.setColor("GREEN");

                PromptActive = false;

                return Interaction.editReply({
                  embeds: [InteractionEmbed],
                  components: [],
                });
              }
            });
            break;
          }

          case "warning-30": {
            InteractionEmbed.setDescription(
              `Are you sure you want to send the 30-minute reminder for this event? **This will send a notification all users marked as interested.**`
            );
            InteractionEmbed.setColor("ORANGE");

            SubmitButton.setLabel("Yes");
            InteractionActionRow.setComponents([SubmitButton, CancelButton]);

            await Interaction.reply({
              embeds: [InteractionEmbed],
              components: [InteractionActionRow],
            });

            DoInteractionCollection(1, (ButtonInteraction) => {
              const Cancelled = ButtonInteraction.customId === "kill";

              if (Cancelled) {
                return CancelCollection();
              } else {
                PushEventUpdate(
                  `${Event.id} will begin in 30 minutes.`,
                  `\`${Event.id}\` will begin in 30 minutes. The event host may deduct credit for being late, or the server (if in-game) may be locked.`
                );
                InteractionEmbed.setDescription("Event reminder sent.");
                InteractionEmbed.setColor("GREEN");

                PromptActive = false;

                return Interaction.editReply({
                  embeds: [InteractionEmbed],
                  components: [],
                });
              }
            });
            break;
          }

          case "warning-15": {
            InteractionEmbed.setDescription(
              `Are you sure you want to send the 15-minute reminder for this event? **This will send a notification all users marked as interested.**`
            );
            InteractionEmbed.setColor("ORANGE");

            SubmitButton.setLabel("Yes");
            InteractionActionRow.setComponents([SubmitButton, CancelButton]);

            await Interaction.reply({
              embeds: [InteractionEmbed],
              components: [InteractionActionRow],
            });

            DoInteractionCollection(1, (ButtonInteraction) => {
              const Cancelled = ButtonInteraction.customId === "kill";

              if (Cancelled) {
                return CancelCollection();
              } else {
                PushEventUpdate(
                  `${Event.id} will begin in 15 minutes.`,
                  `\`${Event.id}\` will begin in 15 minutes. The event host may deduct credit for being late, or the server (if in-game) may be locked.`
                );
                InteractionEmbed.setDescription("Event reminder sent.");
                InteractionEmbed.setColor("GREEN");

                PromptActive = false;

                return Interaction.editReply({
                  embeds: [InteractionEmbed],
                  components: [],
                });
              }
            });
            break;
          }

          case "end": {
            InteractionEmbed.setDescription(
              `Are you sure you want to send the 30-minute reminder for this event? **This will send a notification all users marked as interested.**`
            );
            InteractionEmbed.setColor("ORANGE");

            SubmitButton.setLabel("Yes");
            InteractionActionRow.setComponents([SubmitButton, CancelButton]);

            await Interaction.reply({
              embeds: [InteractionEmbed],
              components: [InteractionActionRow],
            });

            DoInteractionCollection(1, (ButtonInteraction) => {
              const Cancelled = ButtonInteraction.customId === "kill";

              if (Cancelled) {
                return CancelCollection();
              } else {
                PushEventUpdate(
                  `${Event.id} has ended.`,
                  `\`${Event.id}\` has concluded.`
                );
                InteractionEmbed.setDescription("Event reminder sent.");
                InteractionEmbed.setColor("GREEN");

                PromptActive = false;

                return Interaction.editReply({
                  embeds: [InteractionEmbed],
                  components: [],
                });
              }
            });
            break;
          }

          case "submit": {
            const InteractionEmbed = new MessageEmbed()
              .setTitle("Event Update Confirmation")
              .setDescription(
                "Please confirm you want to update the scheduled event with the following information."
              )
              .addField("Event Id", `\`${Event.id}\``)
              .addField("Host", `<@${Event.host}>`, true)
              .addField("Type", `${Event.type}`, true)
              .addField("Length (minutes)", `${Event.length}`)
              .addField("Date (Your local time)", `<t:${Event.date}>`, true)
              .addField("Notes", `${Event.notes}`, true)
              .addField("Interested Attendees", `${Interested.length}`, true)
              .setColor("YELLOW");

            InteractionActionRow.setComponents([SubmitButton, CancelButton]);
            await Interaction.reply({
              embeds: [InteractionEmbed],
              components: [InteractionActionRow],
            });

            DoInteractionCollection(1, async (ButtonInteraction) => {
              const CustomId = ButtonInteraction.customId;

              if (CustomId == "submit") {
                const EventUpdated = await Database.UpdateEvent(Event);

                if (EventUpdated) {
                  InteractionEmbed.setDescription(
                    "The event has successfully been updated."
                  );
                  InteractionEmbed.setColor("GREEN");
                  InteractionEmbed.setFooter({
                    text: "This reply will automatically delete after 20 seconds.",
                  });

                  const Reply = await Interaction.editReply({
                    embeds: [InteractionEmbed],
                    components: [],
                  });

                  PromptActive = false;

                  setTimeout(async () => {
                    try {
                      await Reply.delete();
                    } catch (error) {
                      console.log(error);
                    }
                  }, 20_000);
                } else {
                  InteractionEmbed.setDescription(
                    "An error occured whilst updating the event."
                  );
                  InteractionEmbed.setColor("RED");

                  await Interaction.editReply({
                    embeds: [InteractionEmbed],
                    components: [],
                  });

                  PromptActive = false;
                }
              } else {
                return CancelCollection();
              }
            });

            break;
          }

          default: {
            break;
          }
        }
      });
    } else {
      ControlEmbed.setDescription(
        `No event matching ID \`${EventId}\` was found.`
      );
      ControlEmbed.setColor("RED");

      return Interaction.editReply({
        embeds: [ControlEmbed],
      });
    }
  },
};
