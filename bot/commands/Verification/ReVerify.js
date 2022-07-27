module.exports = {
    name: "reverify",
    description: "Lets users reset their verification data with RaidManager.",

    execute: async function (Bot, Interaction) {
        await Interaction.deferReply({
            fetchReply: true
        });
        
        const Database = Bot.database;
        const Arguments = Interaction.options;
        const Guild = Interaction.guild;

        
    }
}