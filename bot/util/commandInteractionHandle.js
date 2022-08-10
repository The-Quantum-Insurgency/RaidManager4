const { Collection } = require("discord.js");

module.exports = async (Bot, Interaction) => {
  const Client = Bot.Client;
  const Member = Interaction.member;
  const Guild = Interaction.guild;
  const Database = Bot.RaidManager.database;

  const CommandName = Interaction.commandName;
  const Command = await Bot.GetCommand(CommandName);

  if (Command) {
    if (Command.permissions) {
      let Allowed = false;

      if (Member.permissions.has("ADMINISTRATOR") && !Command.developer) {
        Allowed = true;
      } else if (
        Bot.Configuration.commands.developers.includes(Member.id) &&
        Bot.Configuration.commands.allow_developer_bypass
      ) {
        Allowed = true;
      } else {
        Command.permissions.forEach((Permission) => {
          const Components = Permission.split(":");
          const Type = Components[0];
          const Node = Components[1];

          switch (Type) {
            case "ROLE":
              if (Member.roles.resolve(Node)) {
                Allowed = true;
              }
              break;
            case "NODE":
              if (Member.permissions.has(Node)) {
                Allowed = true;
              }
              break;
            case "USER":
              if (Member.user.id == Node || Member.user.tag == Node) {
                Allowed = true;
              }
              break;
            case "GUILD":
              if (Guild.id == Node) {
                Allowed = true;
              }
              break;
            case "CHANNEL":
              if (Channel.id == Node) {
                Allowed = true;
              }
              break;
            case "CATEGORY":
              if (Channel.parent.id == Node || Channel.parent.name == Node) {
                Allowed = true;
              }
              break;
          }
        });
      }

      if (!Allowed) {
        return Interaction.reply({
          content: "You are not allowed to run this command.",
          ephemeral: true,
        });
      }
    }

    const CooldownData = Bot.CooldownData;

    if (Command.cooldown) {
      if (!CooldownData.has(CommandName)) {
        CooldownData.set(CommandName, new Collection());
      }

      if (!Member.permissions.has("MANAGE_MESSAGES")) {
        const Now = Date.now();
        const Timestamps = CooldownData.get(CommandName);
        const CooldownAmount = (Command.cooldown || 3) * 1000;

        if (Timestamps.has(Member.user.id)) {
          const ExpirationTime =
            Timestamps.get(Member.user.id) + CooldownAmount;

          if (Now < ExpirationTime) {
            const TimeLeft = (ExpirationTime - Now) / 1000;

            return Interaction.reply({
              content: `Please wait ${TimeLeft.toFixed(
                1
              )} more second(s) before performing \`${CommandName}\``,
              ephemeral: true,
            });
          }
        }

        Timestamps.set(Member.user.id, Now);
        setTimeout(() => Timestamps.delete(Member.user.id), CooldownAmount);
      }
    }

    try {
      await Command.execute(Bot, Interaction);
    } catch (error) {
      console.error(error);
      
      const replyContent = {
        content:
          `An unexpected error was encountered during command execution. This error has been recorded. \`${error}\``
      }

      const reply = await Interaction.fetchReply();

      if (reply) {
        return Interaction.editReply(replyContent);
      } else { 
        return Interaction.reply(replyContent);
      }
    }
  } else {
    return Interaction.reply({
      content:
        "An internal error has occurred, and the command could not be executed.",
      ephemeral: true,
    });
  }
};
