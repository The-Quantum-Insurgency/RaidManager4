/**
 * @package RaidManager4
 * @name Database Interface
 * @description A global database class for the application.
 * @author imskyyc
 * @param { RaidManager }
 */

const Database = class Database {
  constructor(RaidManager) {
    this.RaidManager = RaidManager;
    this.Configuration = RaidManager.Environment.database
  }

  up = async function () {
    const Configuration = this.Configuration;
    
  };
};

module.exports = Database;
