const { SlashCommandBuilder } = require('discord.js');
const { Firestore } = require('../../database/firestore-database.js');
const { Utility } = require('../../utility.js');
require('dotenv').config()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('authenticate')
        .setDescription('Will authenticate with the Eve Online servers'),
    async execute(interaction) {
        const userData = await Utility.getDiscordUserData(interaction);

        //Check if the user is the owner of the server
        if (interaction.user.id != userData.owner.user.id) {
            await interaction.reply('Only the owner of the server can authenticate');
            return;
        }

        //Create the URL
        const url = 'https://login.eveonline.com/v2/oauth/authorize/?' + new URLSearchParams({
            client_id: process.env.ESI_CLIENT_ID,
            redirect_uri: "http://localhost:3000/callback",
            scope: "esi-industry.read_corporation_mining.v1 esi-characters.read_corporation_roles.v1",
            state: userData.token,
            response_type: "code"
        });

        //Send the URL to the user
        const firestore = new Firestore();

        var signInResult = await firestore.signIn(userData.email, userData.password);
        var userExists = await firestore.doesUserExist(userData.email);
        
        if (signInResult.success && userExists) {
            await interaction.reply('You are already authenticated');
        } else {
            await interaction.reply(`Click [here](${url}) to authenticate`);

            while (!userExists) {
                console.log("Retrying sign in");
                await new Promise(resolve => setTimeout(resolve, 2000));
                userExists = await firestore.doesUserExist(userData.email)
            }
    
    
            signInResult = await firestore.signIn(userData.email, userData.password);
    
            if (signInResult.success) {
                console.log(signInResult.value.user.email + " Signed in");
                var user = signInResult.value.user;
    
                //Get user data from Firestore
                const docSnap = await firestore.getDoc("users", user.uid);
                if (docSnap.exists()) {
                    const data = docSnap.data();
    
                    //Send the welcome message to the Discord server
                    await interaction.followUp(`Welcome ${data.character_name}!`);
                }
            } else {
                console.log(error.stack);
                await interaction.followUp('An error has occurred');
            }
        }

        await firestore.signOut();
    },
};