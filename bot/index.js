/**
 * @name Bot
 * @description RaidManager discord bot entry point
 * @package raidmanager
 * @author imskyyc
 */

const { readdir } = require("fs/promises");
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
    this.Version = RaidManager.VERSION;
  }

  LoadUtils = async function () {
    console.debug("Loading bot utility functions...");

    const Utilities = await readdir("./bot/util");
    await Utilities.forEach((File) => {
      const Name = File.replace(".js", "");
      const Class = require(`./util/${File}`);

      if (typeof Class == "function") {
        this[Name] = Class;
      } else {
        this[Name] = new Class(this);
      }
    });
  };

  LoadCommands = async function () {
    console.debug("Loading bot commands...");

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
          console.error(
            `Error: command ${CommandFile} failed to load. \n${err}`
          );
          continue;
        }

        if (!Command) {
          console.error(`Error: command ${CommandFile} is null / undefined.`);
          continue;
        }

        CommandCollection.set(Command.name, Command);
      }

      CategoryCollection.set(Category, CommandCollection);
    }

    this.Commands = CategoryCollection;
  };

  HookEvents = async function () {
    console.debug("Hooking client events...");

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
    console.debug("Pushing slash commands...");

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

        console.log(
          `Slash commands for guild ${GuildId} successfully registered with Discord API (v10)`
        );
      } catch (err) {
        console.error(
          `Slash commands were unable to be pushed to guild ${GuildId}. Error:`
        );

        console.error(err);
      }
    }
  };

  GetCommand = async function (CommandName) {
    const Commands = this.Commands;
    let Command = undefined;

    const Categories = Array.from(Commands.keys());

    await Categories.every((CategoryName) => {
      const Category = Commands.get(CategoryName);

      if (Category) {
        Command = Category.get(CommandName);

        if (Command) {
          return false;
        } else {
          return true;
        }
      }
    });

    return Command;
  };

  // Lifecycle hooks
  up = async function () {
    console.debug("========== BEGIN BOT LOADING OUTPUT =========");
    console.debug("RaidManager bot load called!");

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

    console.debug("Creating client...");

    const Client = new BotClient({ intents: Intents });

    this.Client = Client;

    await this.LoadUtils();
    await this.LoadCommands();
    await this.HookEvents();

    await Client.login(Configuration.bot.token);

    console.log("RaidManager bot successfully started!");
    console.debug("========== END BOT LOADING OUTPUT ==========");
  };

  reload = async function () {};

  down = async function () {};
};
