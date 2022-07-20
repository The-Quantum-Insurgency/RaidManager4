exports.up = async function (connection) {
    return connection.query(`CREATE TABLE users(
        \`id\` INT(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
        \`user_id\` MEDIUMTEXT NOT NULL,
        \`events_attended\` INT(11) NOT NULL DEFAULT 0,
        \`points\` INT(11) NOT NULL DEFAULT 0,
        \`squadron\` TINYTEXT NOT NULL DEFAULT "None",
        \`roblox_id\` MEDIUMTEXT NOT NULL
    );`);
};
exports.down = async function (connection) {
    return connection.query("DROP TABLE users");
};