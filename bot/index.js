/**
 * @name Bot
 * @description RaidManager discord bot entry point
 * @package RaidManager4
 * @author imskyyc
 */

const { readdir, stat } = require("fs/promises");
const { REST: DiscordAPIConnection } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  Client: BotClient,
  Intents: ClientIntents,
  Collection,
} = require("discord.js");

module.exports = class Bot {
  Events = {};

  constructor(RaidManager) {
    this.RaidManager = RaidManager;
    this.Configuration = RaidManager.Environment.bot;
  }

  LoadUtils = async function () {
    const Utilities = await readdir("./bot/util");
    await Utilities.forEach((File) => {
      const Name = File.replace(".js", "");
      const Class = require(`./bot/util/${File}`);

      this[Name] = new Class(this);
    });
  };

  LoadCommands = async function () {
    const Categories = await readdir("./bot/commands");
    const CategoryCollection = new Collection();

    for (const CategoryIndex in Categories) {
      const Category = Categories[CategoryIndex];

      const Commands = await readdir(`./bot/commands/${Category}`);
      const CommandCollection = new Collection();

      for (const CommandIndex in Commands) {
        const CommandFile = Commands[CommandIndex];

        let Command = undefined;

        try {
          Command = require(`./commands/${Category}/${CommandFile}`);
        } catch (err) {
          process.stderr.write(
            `Error: command ${CommandFile} failed to load. \n${err}`
          );
          continue;
        }

        if (!Command) {
          process.stderr.write(
            `Error: command ${CommandFile} is null / undefined.`
          );
          continue;
        }

        CommandCollection.set(CommandFile, Command);
      }

      CategoryCollection.set(Category, CommandCollection);
    }
  };

  HookEvents = async function () {
    const Client = this.Client;

    const Events = await readdir("./bot/events");
    Events.forEach((File) => {
      const Name = File.replace(".js", "");
      const Event = require(`./events/${Name}`);
      const Function = Event.bind(null, this);

      if (this.Events[Name]) {
        Client.removeListener(Name, this.Events[Name]);
      }

      this.Events[Name] = Function;

      Client.on(Name, Function);
    });
  };

  CommandCollectionToArray = async function (Collection) {
    let Commands = [];

    Array.from(Collection.values()).forEach((Category) => {
      Array.from(Category.values()).forEach((Command) => {
        const SlashCommand = new SlashCommandBuilder()
          .setName(Command.name)
          .setDescription(Command.description);

        SlashCommand.options = Command.options || [];

        Commands.push(SlashCommand.toJSON());
      });
    });

    return Commands;
  };

  PushSlashCommands = async function (Commands) {
    const Client = this.Client;
    const Configuration = this.Configuration;
    const GuildIds = Configuration.commands.slash_command_guilds;
    const API = new DiscordAPIConnection({ version: "10" }).setToken(
      Configuration.bot.token
    );

    for (const Index in GuildIds) {
      const GuildId = GuildIds[Index];

      try {
        await API.put(
          Routes.applicationGuildCommands(Client.user.id, GuildId),
          { body: Commands }
        );

        process.stdout.write(
          `Slash commands for guild ${GuildId} successfully registered with Discord API (v10)`
        );
      } catch (err) {
        process.stderr.write(
          `Slash commands were unable to be pushed to guild ${GuildId}. Error: \n${err}`
        );
      }
    }
  };

  // Lifecycle hooks
  up = async function () {
    const Configuration = this.Configuration;
    const Flags = ClientIntents.FLAGS;
    const Intents = [
      Flags.GUILDS,
      Flags.GUILD_MEMBERS,
      Flags.GUILD_BANS,
      Flags.GUILD_EMOJIS_AND_STICKERS,
      Flags.GUILD_INTEGRATIONS,
      Flags.GUILD_WEBHOOKS,
      Flags.GUILD_INVITES,
      Flags.GUILD_VOICE_STATES,
      Flags.GUILD_PRESENCES,
      Flags.GUILD_MESSAGES,
      Flags.GUILD_MESSAGE_REACTIONS,
      Flags.GUILD_MESSAGE_TYPING,
      Flags.GUILD_SCHEDULED_EVENTS,
      Flags.DIRECT_MESSAGES,
      Flags.DIRECT_MESSAGE_REACTIONS,
      Flags.DIRECT_MESSAGE_TYPING,
    ];

    const Client = new BotClient({ intents: Intents });
    await Client.login(Configuration.bot.token);

    this.Client = Client;

    const User = Client.user;
    await User.setActivity("Starting up...");

    await this.LoadUtils();
    await this.LoadCommands();
    await this.HookEvents();
  };

  reload = async function () {};

  down = async function () {};
};
