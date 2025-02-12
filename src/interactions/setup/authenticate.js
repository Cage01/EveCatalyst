const { MessageFlags } = require('discord.js');
const { Firestore } = require('../../database/firestore-database.js');
const { Utility } = require('../../utility.js');

require('dotenv').config()

async function authenticate(interaction) {
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

    var messageText = '';

    if (signInResult.success && userExists) {
        const user = await firestore.getUser(signInResult.value.user.uid);
        messageText = 'Logged in as: **' + user.value.character_name + '**';
        await interaction.reply({ content: messageText, flags: MessageFlags.Ephemeral });
    } else {
        await interaction.reply({ content: `Click [here](${url}) to authenticate`, flags: MessageFlags.Ephemeral });

        while (!userExists) {
            console.log("Retrying sign in");
            await new Promise(resolve => setTimeout(resolve, 2000));
            userExists = await firestore.doesUserExist(userData.email)
        }


        signInResult = await firestore.signIn(userData.email, userData.password);

        if (signInResult.success) {
            console.log(signInResult.value.user.email + " Signed in");

            //Get user data from Firestore
            const user = await firestore.getUser(signInResult.value.user.uid);

            //Send the welcome message to the Discord server
            messageText = 'Logged in as: **' + user.value.character_name + '**';
            await interaction.editReply({ content: messageText, flags: MessageFlags.Ephemeral });

        } else {
            console.log(signInResult.error.stack);
            await interaction.editReply({ content: 'An error has occurred', flags: MessageFlags.Ephemeral });
        }
    }


    await firestore.signOut();
    return messageText + '\n';
}

module.exports = { authenticate };