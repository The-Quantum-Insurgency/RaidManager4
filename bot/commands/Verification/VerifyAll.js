const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  name: "verifyall",
  description: "Lets guild administrators verify all users in the guild.",

  cooldown: 60,

  permissions: [],

  execute: async function (RaidManager, Interaction) {
    const Channel = Interaction.channel;
    const Guild = Interaction.guild;
    const Database = RaidManager.Database;
    const Members = await Guild.members.list({
      limit: 1000,
      cache: false,
    });

    const UpdateEmbed = new MessageEmbed()
      .setTitle("TQI VerifyAll")
      .setDescription(
        `Verifying ${Members.size} members, this will take awhile...`
      )
      .setColor("ORANGE")
      .setFooter(await RaidManager.EmbedFooter(RaidManager));

    await Interaction.reply({
      embeds: [UpdateEmbed],
    });

    const Keys = Array.from(Members.keys());

    for (const Index in Keys) {
      const Key = Keys[Index];
      const Member = Members.get(Key);

      const User = await Database.GetUser(Member.id);

      if (User) {
        continue;
      } else {
        console.log(Member.id);
        const Request = await fetch(
          `https://api.blox.link/v1/user/${Member.id}`
        ).then((res) => res.json());

        if (Request.error) continue;

        const Verified = await Database.VerifyUser(
          Member.id,
          Request.primaryAccount
        );
        console.log(`Verified: ${Verified}`);

        await RaidManager.Thread.Sleep(2000);
      }
    }
  },
};
