const { SlashCommandBuilder } = require('discord.js');
require('dotenv').config()

module.exports = {
	data: new SlashCommandBuilder()
		.setName('authenticate')
		.setDescription('Will authenticate with the Eve Online servers'),
	async execute(interaction) {
        const guild = interaction.guild.id;
        const owner = await interaction.guild.fetchOwner();
        console.log(guild + ":" + owner.user.tag + ":" + owner.user.id);
        
		const url = 'https://login.eveonline.com/v2/oauth/authorize/?' + new URLSearchParams({
            client_id: process.env.ESI_CLIENT_ID,
            redirect_uri:"http://localhost:3000/callback",
            scope:"esi-industry.read_corporation_mining.v1 esi-characters.read_corporation_roles.v1",
            state: btoa(guild + ":" + owner.user.tag + ":" + owner.user.id),
            response_type:"code"
        });

        

        await interaction.reply(`Click [here](${url}) to authenticate`);

        //Check firebase every 2 seconds?
        //while (firebaseResponse == null) 
        //  Check Firebase
        //  wait(2)
        //interaction.followUp('welcome')
	},
};


// fetch('https://example.com?' + new URLSearchParams({
//     foo: 'value',
//     bar: 2,
// }).toString())