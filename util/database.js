/**
 * @package RaidManager4
 * @name database.ts
 * @description A global database class for the application.
 * @author imskyyc
 * @param { RaidManager }
 */

const MySQL = require("mysql2/promise")
const Database = class Database {
  RaidManager = null
  Configuration = null
  pool = null

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

  // User functions
  getUser = async function(userId) {
    const results = await this.query("SELECT * FROM users WHERE id=? OR user_id=? OR roblox_id=?", [
      userId,
      userId,
      userId
    ])

    if (results[0]) {
      return results[0][0]; 
    }
  }

  setUser = async function(userId, dataTable) {
    var results = [];
    var dataTable = dataTable || {};
    var existingUser = await this.getUser(userId);

    if (existingUser) {
      results = await this.query(`UPDATE users SET user_id=?, events_attended=?, squadron=?, roblox_id=? WHERE user_id=?`, [
        dataTable.user_id || existingUser.user_id || userId,
        dataTable.events_attended || existingUser.events_attended || 0,
        dataTable.squadron || existingUser.squadron || "None",
        dataTable.roblox_id || existingUser.roblox_id || -1,

        userId
      ])
    } else {
      await this.query(`INSERT INTO users(
        user_id,
        events_attended,
        squadron,
        roblox_id
      ) VALUES(?, ?, ?, ?)`, [
        userId,

        dataTable.events_attended || 0,
        dataTable.squadron || "None",
        dataTable.roblox_id || -1
      ])

      results = await this.getUser(userId);
    }

    return results;
  }

  // Guild functions
  getGuild = async function(guildId) {
    const [ results ] = await this.query(`SELECT * FROM guild_data WHERE id=? OR guild_id=?`, [
      guildId,
      guildId
    ])

    return results[0];
  }
  
  setGuild = async function(guildId, dataTable) {
    var results = [];
    var dataTable = dataTable || {};

    dataTable.bind_data = JSON.stringify(dataTable.bind_data);
    dataTable.pending_imports = JSON.stringify(dataTable.pending_imports);
    dataTable.audit_logs = JSON.stringify(dataTable.audit_logs);

    var existingGuild = await this.getGuild(guildId);
    if (existingGuild) {

      results = await this.query(`UPDATE guild_data SET bind_data=?,pending_imports=?,audit_logs=? WHERE guild_id=?`, [
        dataTable.bind_data || existingGuild.bind_data,
        dataTable.pending_imports || existingGuild.pending_imports,
        dataTable.audit_logs || existingGuild.audit_logs,
        
        guildId
      ])

    } else {
      await this.query(`INSERT INTO guild_data(
        guild_id,
        bind_data,
        pending_imports,
        audit_logs
      ) VALUES(?, ?, ?, ?)`, [
        guildId,

        dataTable.bind_data || '{}',
        dataTable.pending_imports || '{}',
        dataTable.audit_logs || '{"channel_id": 0, "hooks": [], "logs": []}'
      ])

      results = await this.getGuild(guildId);
    }

    return results;
  }
};

module.exports = Database;
