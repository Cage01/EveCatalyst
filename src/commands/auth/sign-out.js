const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { Firestore } = require('../../database/firestore-database.js');
const { Utility } = require('../../utility.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('signout')
		.setDescription('Signs out of the application and revokes access to the Eve Online API'),
	async execute(interaction) {
        const userData = await Utility.getDiscordUserData(interaction);

		const firestore = new Firestore();
        const result = await firestore.deleteUser(userData.email, userData.password);

        if (result.success) {
            await interaction.reply({ content: 'You have been signed out', flags: MessageFlags.Ephemeral});
        } else {
            await interaction.reply({ content: 'There was an error signing you out', flags: MessageFlags.Ephemeral});
        }
        
	},
};
