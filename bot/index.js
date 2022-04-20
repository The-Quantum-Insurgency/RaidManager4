/**
 * @name Bot
 * @description RaidManager discord bot entry point
 * @package RaidManager4
 * @author imskyyc
 */

const { readdir } = require ('fs/promises');
const { Client:client, Intents:intents } = require('discord.js');

module.exports = class Bot {
  constructor(RaidManager) {
    this.RaidManager = RaidManager;
    this.Configuration = RaidManager.Environment.bot;
  }

  LoadUtils = async function() {
    const Utilities = await readdir("./bot/util");
    await Utilities.forEach((File) => {
      const Name = File.replace(".js", "");
      const Class = require(`./bot/util/${File}`);

      this[Name] = new Class(this);
    });
  }

  LoadCommands = async function() {

  }

  HookEvents = async function() {

  }

  // Lifecycle hooks
  up = async function () {
    const Configuration = this.Configuration;
    const Flags = intents.FLAGS;
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
    ]

    const Client = new client({intents: Intents})
    await Client.login(Configuration.bot.token)

    const User = Client.user;
    User.setActivity("Starting up...");

    await this.LoadUtils();
    await this.LoadCommands();
    await this.HookEvents();
  }

  reload = async function () {

  }

  down = async function () {

  }
};
