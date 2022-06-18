## <strong>RaidManager4</strong>
<br />
<div align="center">
    <a href="https://github.com/imskyyc/RaidManager4/actions/workflows/node.js.yml">
        <img src="https://github.com/imskyyc/RaidManager4/actions/workflows/node.js.yml/badge.svg">
    </a>
    <a href="https://github.com/imskyyc/RaidManager4/blob/master/LICENSE">
        <img src="https://img.shields.io/github/license/imskyyc/RaidManager4"/>
    </a>
    <a href="https://github.com/imskyyc/RaidManager4/releases">
        <img src="https://img.shields.io/github/v/release/imskyyc/RaidManager4?label=version"/>
    </a>
    <a href="https://discord.gg/3AsPFgdUZ2">
        <img src="https://img.shields.io/discord/966180940827226163?label=discord&logo=discord&logoColor=white"/>
    </a>
</div>

<br />

**NOTE: THIS IS A MOSTLY PROPRIETARY SOLUTION CODED UNIQUELY TO FIT TQI'S NEEDS. THIS IS NOT THE "BE ALL AND END ALL" FOR MOST CASES! The bot is open to modify however you want, but it is preferred if the source is credited, so other people can find this repository.**

---

The RaidManager is [TQI's](https://www.roblox.com/groups/8592261/The-Quantum-Insurgency#!/about) made-in-house (I don't like using the word proprietary) solution for Discord Management, Event Scheduling, and userdata storage.

---
## Installation

Installation is a fairly straightforward process.

First, copy the configuration:
```
cp -r .config.example/ .config/
```

Second, fetch all the dependencies for the Raid Manager
```
yarn install
```
OR
```
npm install
```

And you're done!

---
## Configuration

To run the Raid Manager, you need to have a working MySQL or MariaDB installation, and configure the credentials in `.config/app.toml`. The Raid Manager makes use of the TOML configuration file type. Documentation can be found [here](https://toml.io/en/).

Example of app.toml:
```toml
# Raid Manager global configuration


[app]
APP_NAME = "RaidManager4"
APP_VERSION = "4.0.0"
BOT_ENABLED = true
API_ENABLED = true

[database]
enabled = true
type = "mysql"
host = "127.0.0.1"
base = "tqi"
user = "RaidManager4"
pass = "password"

[redis]
enabled = false
```

After configuring your database connection, you must run:
`node raidmanager db:init`.
This will migrate all tables defined in the `.config/db` folder to the database, so data can be read from and written to.

Also, if using the discord bot, make sure to update the token and settings in `.config/bot/bot.toml`. The files `guidelines.json` and `status.json` are for configuring TQI's guidelines in the [#guidelines](https://discord.com/channels/857445688932696104/857449102220591114) channel in our discord. `gudelines.json` can safely be removed, but will break commands like `/information` due to them requiring the file to be present.

**Note: if using Slash Commands, Guild Ids must be in QUOTES, example:**
```toml
slash_command_guild_ids = ["966180940827226163"]
```

This is due to a limitation in Node with large numbers. **If you get a missing access error, and the outputted server id (the last number in the request URL) does not match the Guild Id configured, then you did not put quotes around the Guild Id. **Do not report missing access errors, unless you are absolutely sure the request was made with the correct parameters.**

---
## Usage
To start the bot, run: `node raidmanager start`. Optionally, the `--debug` flag can be added for additional debug outputs.

The script `raidmanager` is the CLI tool used for interacting with the application. A list of commands can be found via `node raidmanager help` or just `node raidmanager`. The script is similar to [Laravel's](https://github.com/laravel/laravel) PHP Artisan CLI.

---
## CLI Configuration
If you'd like to modify the CLI to better suit your workflow, you can modify the ".raidmanagerrc" file that is automatically created upon running the RaidManager CLI for the first time.

Currently, the only supported CLI Configuration option is `check_for_updates_on_start`, which as the name says, checks for updated when the RaidManager CLI is started.
---
## Reporting Bugs & Problems

If you find any bugs or have suggestions, use the [issues](https://github.com/imskyyc/RaidManager4/issues) tab on the RaidManager [GitHub](https://github.com/imskyyc/RaidManager4). For security vulnerabilities, please privately report them by creating a ticket in our [Discord Server](https://discord.gg/3AsPFgdUZ2).
