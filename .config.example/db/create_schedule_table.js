exports.up = async function (connection) {
    return connection.query(`CREATE TABLE schedule(
        \`id\` INT(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
        \`host\` MEDIUMTEXT NOT NULL,
        \`type\` TINYTEXT NOT NULL,
        \`length\` TINYINT(4) NOT NULL,
        \`date\` BIGINT(30) NOT NULL,
        \`notes\` LONGTEXT NOT NULL,
        \`interested\` LONGTEXT NOT NULL DEFAULT "{}",
        \`announcement_id\` MEDIUMTEXT NOT NULL
    );`);
};
exports.down = async function (connection) {
    return connection.query("DROP TABLE schedule");
};