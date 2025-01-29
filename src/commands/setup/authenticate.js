const { SlashCommandBuilder } = require('discord.js');
const { Firestore } = require('../../database/firestore-database.js');
require('dotenv').config()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('authenticate')
        .setDescription('Will authenticate with the Eve Online servers'),
    async execute(interaction) {
        const guildID = interaction.guild.id;
        const owner = await interaction.guild.fetchOwner();

        //Check if the user is the owner of the server
        if (interaction.user.id != owner.user.id) {
            await interaction.reply('Only the owner of the server can authenticate');
            return;
        }

        //Create the URL
        const url = 'https://login.eveonline.com/v2/oauth/authorize/?' + new URLSearchParams({
            client_id: process.env.ESI_CLIENT_ID,
            redirect_uri: "http://localhost:3000/callback",
            scope: "esi-industry.read_corporation_mining.v1 esi-characters.read_corporation_roles.v1",
            state: btoa(guildID + ":" + owner.user.tag + ":" + owner.user.id),
            response_type: "code"
        });


        //Send the URL to the user
        await interaction.reply(`Click [here](${url}) to authenticate`);

        const firestore = new Firestore();

     
        // const firebaseLoginUrl = "http://localhost:3000/login/?" + new URLSearchParams({
        //     token: btoa(guildID + ":" + owner.user.tag + ":" + owner.user.id)
        // });

        // var response;
        // statusCode = 404;
        // while (statusCode == 404) {
        //     response = await axios.get(firebaseLoginUrl);
        //     statusCode = response.status;
        //     //Wait 2 seconds
        //     if (statusCode == 404)
        //         await new Promise(resolve => setTimeout(resolve, 2000));
        // }

        // console.log(response.data);

        // const character = await axios.get("http://localhost:3000/character/?" + new URLSearchParams({
        //     uid: response.data.uid
        // }));


        // await interaction.followUp(`Welcome ${character.data.character_name}!`);

        //Check firebase every 2 seconds?
        //while (firebaseResponse == null) 
        //  Check Firebase
        //  wait(2)
        //interaction.followUp('welcome')
    },
};