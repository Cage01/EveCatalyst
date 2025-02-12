const { SlashCommandBuilder } = require('discord.js');
const { createSetupCompleteEmbed } = require('../../embeds/index.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('show-settings')
		.setDescription('Replies with the current server configuration'),
	async execute(interaction) {
		await interaction.reply({embeds: [await createSetupCompleteEmbed(interaction)]});
	},
};
