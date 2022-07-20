/**
 * @package RaidManager4
 * @name database.js
 * @description A global database class for the application.
 * @author imskyyc
 * @param { RaidManager }
 */

const MySQL = require("mysql2/promise")
const Database = class Database {
  constructor(RaidManager) {
    this.RaidManager = RaidManager;
    this.Configuration = RaidManager.Environment.database;
  }

  up = async function () {
    const Configuration = this.Configuration;
    
    this.pool = await MySQL.createPool({
      host: Configuration.host,
      database: Configuration.base,
      user: Configuration.user,
      password: Configuration.pass,

      waitForConnections: Configuration.wait_for_connections,
      connectionLimit: Configuration.connection_limit,
      queueLimit: Configuration.queue_limit
    })
  };

  reload = async function () {};

  down = async function () {};

  getPool = function() {
    return this.pool;
  }

  query = function(queryString, parameters) {
    return this.getPool().query(queryString, parameters)
  }

  getUser = function(userId) {
    const [ results, fields ] = this.query("SELECT * FROM users WHERE id=? OR user_id=? OR roblox_id=?", [
      userId,
      userId,
      userId
    ])

    return results.rows || [];
  }

  setUser = async function(userId, dataTable) {
    var results = [];
    if (this.getUser(userId)) {
      results = await this.query(`UPDATE users`)
    } else {
      results = await this.query(`INSERT INTO users(
        user_id,
        events_attended,
        points,
        squadron,
        roblox_id
      ); VALUES(?, ?, ?, ?, ?)`, [
        dataTable.user_id,
        dataTable.events_attended,
        dataTable.points,
        dataTable.squadron,
        dataTable.roblox_id
      ])
    }

    return results;
  }
};

module.exports = Database;
