module.exports = {
    name: "reverify",
    description: "Lets guild administrators force-update a guild member's roles, and nickname.",

    permissions: ["NODE:ADMINISTRATOR"],

    execute: async function (Bot, Interaction) {
        await Interaction.deferReply({
            fetchReply: true
        });
        
        const Database = Bot.database;
        const Arguments = Interaction.options;
        const Guild = Interaction.guild;

        
    }
}