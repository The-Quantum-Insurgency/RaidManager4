/**
 * @package RaidManager4
 * @name ready.js
 * @description Client onReady listener
 * @author imskyyc
 * @param { Bot } Bot
 */
const FileSystem = require("fs/promises");

module.exports = async function (Bot) {
  const Client = Bot.Client;
  const placeholderParser = Bot.RaidManager.placeholderParser;

  // Check for raidmanager tempfile
  try {
    const Tempdata = await (
      await FileSystem.readFile("raidmanager.temp")
    ).toString();

    const ShutdownData = Tempdata.split("\n");
    const ShutdownChannelId = ShutdownData[0];
    const ShutdownMessageId = ShutdownData[1];

    const Channel = await Client.channels.resolve(ShutdownChannelId);
    const Message = await Channel.messages.fetch(ShutdownMessageId);

    const Embed = Message.embeds[0];
    Embed.setColor("GREEN").setDescription("Reboot complete.");

    await Message.edit({
      embeds: [Embed],
    });

    await FileSystem.unlink("raidmanager.temp");
  } catch (err) {
    if (err.code != "ENOENT") {
      console.error(err);
      console.error(
        "This is an error relating to the usage of the /reboot command. The `raidmanager.temp` file may not have been deleted. Please ensure the file is removed and try again."
      );
    }
  }

  // Send slash commands to discord API
  const Commands = Bot.Commands;
  const CommandArray = await Bot.CommandCollectionToArray(Commands);

  await Bot.PushSlashCommands(CommandArray);

  // Bot status message cycle
  const statusFileName = Bot.Configuration.files.status_message_file

  if (statusFileName != "") {
    const statusFile = await JSON.parse(await FileSystem.readFile(`.config/bot/${statusFileName}`))
    const interval = statusFile.interval;
    const messages = statusFile.messages;

    async function setStatus() {
      const randomMessage = messages[Math.floor(Math.random()*messages.length)]
      const message = await Object.assign({}, randomMessage);

      for (var i = 0; i < message.activities.length; i++) {
        const activity = message.activities[i];
        activity.name = await placeholderParser.Parse(activity.name);
      }

      console.debug(`Setting presence to: ${message.activities[0].type} ${message.activities[0].name}`)

      Client.user.setPresence(message);
    }

    setStatus();

    setInterval(setStatus, interval * 1000)
  }
};
