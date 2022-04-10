/**
 * @package RaidManager4
 * @name Database Interface
 * @description A global database class for the application.
 * @author imskyyc
 * @param { RaidManager }
 */

const Knex = require('knex')

const Database = class Database {
  constructor(RaidManager) {
    this.RaidManager = RaidManager;
    this.Configuration = RaidManager.Environment.database
  }

  up = async function () {
    const Configuration = this.Configuration;
    const Connection = Knex({
      client: Configuration.type,
      connection: {
        host: Configuration.host,
        user: Configuration.user,
        password: Configuration.pass,
        database: Configuration.database
      }
    })
  };
};

module.exports = Database;
