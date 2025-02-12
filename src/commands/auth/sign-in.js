const { SlashCommandBuilder } = require('discord.js');
const { authenticate } = require('../../interactions/index.js');
require('dotenv').config()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('signin')
        .setDescription('Will authenticate with the Eve Online servers'),
    async execute(interaction) {
        await authenticate(interaction);
    },
};