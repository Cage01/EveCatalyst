const { EmbedBuilder } = require('discord.js');
const { Utility } = require('../utility');
const { Firestore } = require('../database/firestore-database');

async function createSetupCompleteEmbed(interaction) {
    const firestore = new Firestore();
    const userData = await Utility.getDiscordUserData(interaction);
    const signInResult = await firestore.signIn(userData.email, userData.password);
    const user = (await firestore.getUser(signInResult.value.user.uid)).value;

    return new EmbedBuilder()
        .setColor("#00b0f4")
        .setAuthor({ name: user.character_name, iconURL: `https://images.evetech.net/characters/${user.character_id}/portrait` })
        .setTitle("Setup Complete")
        .setDescription("Thank you for taking the time to complete the bot setup. Below you will find a summary of the options you have selected.")
        .addFields(
            {
                name: "__Moon Extractions__",
                value: "*  Notifications: `" + user.moon_extraction + "`\n* Channels: " + user.moon_extraction_channels.map(channel => `<#${channel}>`).join(", "),
                inline: false
            },
            {
                name: "__Mining Ledgers__",
                value: "* Notifications: `" + user.mining_ledger + "`\n* Channels: " + user.mining_ledger_channels.map(channel => `<#${channel}>`).join(", "),
                inline: false
            },
            {
                name: "__Sov Map__",
                value: "* Notifications: `" + user.sov_map + "`\n* Channels: " + user.sov_map_channels.map(channel => `<#${channel}>`).join(", ") + "\n* Frequency: `" + user.sov_map_frequency + "`",
                inline: false
            },
            {
                name: "__Monthly Economic Reports__",
                value: "* Notifications: `" + user.monthly_economic_reports + "`\n* Channels: " + user.monthly_economic_reports_channels.map(channel => `<#${channel}>`).join(", "),
                inline: false
            })
        .setImage("https://images3.alphacoders.com/827/thumb-1920-82725.jpg")
        .setThumbnail(`https://images.evetech.net/corporations/${user.corporation_id}/logo?size=64`)
        .setFooter({
            text: "Eve Online",
            iconURL: "https://global.discourse-cdn.com/eveonline/original/3X/4/1/41ec4921cbaca7a6f9ea556e7cc20018461eae5e.png",
        })
        .setTimestamp();


    
}

module.exports = { createSetupCompleteEmbed };