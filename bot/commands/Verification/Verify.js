const { SlashCommandStringOption } = require("@discordjs/builders");

module.exports = {
  name: "verify",
  description:
    "Lets users link their ROBLOX accounts to their Discord accounts via the RaidManager.",
  options: [
    new SlashCommandStringOption()
      .setName("username")
      .setDescription(
        "(OPTIONAL, RE-VERIFICATION ONLY) Manually sets a username to search for while running verification."
      )
      .setRequired(false),
  ],

  cooldown: 30,

  execute: async function (RaidManager, Interaction) {
    const Database = RaidManager.Database;
    const Arguments = Interaction.options;

    const Member = Interaction.member;

    console.log(Member.user.username);

    const Username = (await Arguments.get("username")) || { value: false };
    const User = await Database.GetUser(Member.id);

    if (Username.value != false) {
      if (User) {
        return RaidManager.ReVerifyUser(
          RaidManager,
          Interaction,
          User,
          Username.value
        );
      } else {
        return RaidManager.VerifyUser(RaidManager, Interaction, Username.value);
      }
    } else {
      if (User) {
        return RaidManager.UpdateUser(RaidManager, Interaction, User);
      } else {
        return RaidManager.VerifyUser(RaidManager, Interaction);
      }
    }
  },
};
