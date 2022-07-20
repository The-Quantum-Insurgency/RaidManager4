exports.up = async function (connection) {
    return connection.query(`CREATE TABLE guild_data(
        \`id\` INT(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
        \`guild_id\` MEDIUMTEXT NOT NULL,
        \`bind_data\` LONGTEXT NOT NULL DEFAULT '{"default_roles": [], "role_binds": [], "gamepass_binds": []}',
        \`audit_logs\` LONGTEXT NOT NULL DEFAULT '{"channel_id": 0, "hooks": [], "logs": []}'
    );`)
};
exports.down = async function (connection) {
    return connection.query("DROP TABLE guild_data");
};