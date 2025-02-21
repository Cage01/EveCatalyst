const { Client, Events, MessageFlags, GatewayIntentBits } = require('discord.js');
const { EveEvents } = require('./events/load-events.js');
const Commands = require('./commands/load-commands.js')
const { fork } = require('child_process');
require('dotenv').config()

// Start the server
fork('./src/server/init.js');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

//Register and load commands
client.commands = new Commands().getCommandList();


EveEvents.load(client);

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
// client.once(Events.ClientReady, readyClient => {
// 	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
// });

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);


// Handles the command event and executes the command if it is found.
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
})