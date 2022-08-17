/**
 * @name embedHeader.js
 * @description Returns the default RaidManager bot message embed footer
 * @package raidmanager
 * @author pbstFusion
 */

 module.exports = async function (Bot, ExtraString) {
    ExtraString = ExtraString || "";
    return {
      "author": {
        "name": "RAIDMANAGER4",
        "icon_url": await Bot.Client.user.avatarURL()
        "url": "https://github.com/The-Quantum-Insurgency/RaidManager4/"
      }
    };
  };
