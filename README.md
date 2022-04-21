## <strong>RaidManager4</strong>
<br />
<div align="center">
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

**Note: The Raid Manager was developed around MariaDB. MySQL support is NOT tested.**

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
```

Also, if using the discord bot, make sure to update the token and settings in `.config/bot/bot.toml`. The files `guidelines.json` and `status.json` are for configuring TQI's guidelines in the [#guidelines](https://discord.com/channels/857445688932696104/857449102220591114) channel in our discord. `gudelines.json` can safely be removed, but will break commands like `/information` due to them requiring the file to be present.

---
## Usage
To start the bot, run: `node raidmanager start`. Optionally, the `--debug` flag can be added for additional debug outputs.

The script `raidmanager` is the CLI tool used for interacting with the application. A list of commands can be found via `node raidmanager help` or just `node raidmanager`. The script is similar to [Laravel's](https://github.com/laravel/laravel) PHP Artisan CLI.

---
## Reporting Bugs & Problems

If you find any bugs or have suggestions, use the [issues](https://github.com/imskyyc/RaidManager4/issues) tab on the RaidManager [GitHub](https://github.com/imskyyc/RaidManager4). For security vulnerabilities, please privately report them by creating a ticket in our [Discord Server](https://discord.gg/3AsPFgdUZ2).