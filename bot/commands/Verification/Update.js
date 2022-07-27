module.exports = {
    name: "update",
    description: "Allows administrators to update an existing guild member.",

    permssions: ["NODE:ADMINISTRATOR"],

    execute: async function (Bot, Interaction) {
        await Interaction.deferReply({
            fetchReply: true
        });
        
        const Database = Bot.database;
        const Arguments = Interaction.options;
        const Guild = Interaction.guild;

        
    }
}