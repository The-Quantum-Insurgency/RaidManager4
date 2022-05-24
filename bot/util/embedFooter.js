/**
 * @name embedFooter.js
 * @description Returns the default RaidManager bot message embed footer
 * @package raidmanager
 * @author imskyyc
 */

 module.exports = async function (Bot, ExtraString) {
    ExtraString = ExtraString || "";
    return {
      text: `RaidManager ${Bot.Version} ${
        (ExtraString != "" && " | ") || ""
      } ${ExtraString}`,
      iconURL: await Bot.Client.user.avatarURL(),
    };
  };