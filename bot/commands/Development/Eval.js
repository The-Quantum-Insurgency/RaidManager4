const { SlashCommandStringOption } = require("@discordjs/builders");
const Discord = require("discord.js");
module.exports = {
  name: "eval",
  description: "Evaluate raw javascript. (very dangerous)",
  options: [
    new SlashCommandStringOption()
      .setName("javascript")
      .setDescription("Evaluate raw javascript. (very dangerous)")
      .setRequired(true),
  ],

  developer: true,

  permissions: ["USER:250805980491808768"],

  /**
   * @param {Discord.Interaction} Interaction
   */
  execute: async function (RaidManager, Interaction) {
    CleanString = async (string) => {
      if (string && string.constructor.name == "Promise") string = await string;
      if (typeof string !== "string")
        string = require("util").inspect(string, { depth: 1 });

      string = string
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203))
        .replace(
          RaidManager.Client.token,
          "[Content Removed for Security Reasons.]"
        );
      return string;
    };
    try {
      const code = Interaction.options.get("javascript").value;
      const evaled = eval(code.toString());
      let clean = await CleanString(evaled);
      Interaction.reply({
        content: `\`Success!\``,
        files: [
          {
            attachment: Buffer.from(clean),
            name: "results.js",
          },
        ],
      });
    } catch (error) {
      Interaction.reply({
        content: `\`Error!\``,
        files: [
          {
            attachment: Buffer.from(await CleanString(error)),
            name: "results.js",
          },
        ],
      });
    }
  },
};
