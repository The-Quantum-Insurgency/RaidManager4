exports.up = async function (connection) {
    return connection.query(`CREATE TABLE api_keysets(
        \`id\` INT(11) PRIMARY KEY AUTO_INCREMENT NOT NULL,
        \`name\` TINYTEXT NOT NULL,
        \`key\` LONGTEXT NOT NULL,
        \`administrator\` INT(1) NOT NULL DEFAULT 0,
        \`database.can_query\` TINYTEXT NOT NULL DEFAULT "[]",
        \`database.read\` INT(1) NOT NULL DEFAULT 0,
        \`database.write\` INT(1) NOT NULL DEFAULT 0,
        \`users.get\` INT(1) NOT NULL DEFAULT 0,
        \`users.set\` INT(1) NOT NULL DEFAULT 0,
        \`schedule.get\` INT(1) NOT NULL DEFAULT 0,
        \`schedule.create\` INT(1) NOT NULL DEFAULT 0,
        \`schedule.update\` INT(1) NOT NULL DEFAULT 0,
        \`schedule.delete\` INT(1) NOT NULL DEFAULT 0,
        \`guild.get_all\` INT(1) NOT NULL DEFAULT 0,
        \`guild.get.bind_data\` INT(1) NOT NULL DEFAULT 0,
        \`guild.get.mod_logs\` INT(1) NOT NULL DEFAULT 0,
        \`guild.get.default_roles\` INT(1) NOT NULL DEFAULT 0
    );`)
};
exports.down = async function (connection) {
    return connection.query(`DROP TABLE api_keysets;`)
};