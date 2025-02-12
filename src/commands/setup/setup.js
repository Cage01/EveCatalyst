const { ActionRowBuilder, SlashCommandBuilder, ChannelSelectMenuBuilder, ChannelType, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags } = require('discord.js');
const { Firestore } = require("../../database/firestore-database.js");
const { Utility } = require("../../utility.js");
const { authenticate } = require("../../interactions/index.js");
const { createSetupCompleteEmbed } = require("../../embeds/index.js");

require('dotenv').config()

const firestore = new Firestore();

const Options = Object.freeze({
    MoonExtraction: { text: 'Moon Extraction Notifications', key: 'moon_extraction' },
    MiningLedger: { text: 'Mining Ledger Notifications', key: 'mining_ledger' },
    SovMap: { text: 'Sov Map Notifications', key: 'sov_map' },
    MonthlyEconomicReports: { text: 'Monthly Economic Reports', key: 'monthly_economic_reports' }
});

//#region ActionRowBuilders
const yesID = 'notification_select_yes';
const noID = 'notification_select_no';
const channelSelectID = 'channel_select';

//Select the channels to send moon extraction notifications to
const channelSelect = new ActionRowBuilder()
    .addComponents(
        new ChannelSelectMenuBuilder()
            .setCustomId(channelSelectID)
            .setPlaceholder('Select a channel')
            .setMinValues(1)
            .setMaxValues(3) //TODO: Change this to the server limit
            .setChannelTypes(ChannelType.GuildText)
    );

//Ask the user if they would like to setup moon extraction notifications
const notificationSelect = new ActionRowBuilder()
    .addComponents(new ButtonBuilder()
        .setCustomId(yesID)
        .setLabel('Yes')
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(new ButtonBuilder()
        .setCustomId(noID)
        .setLabel('No')
        .setStyle(ButtonStyle.Danger)
    );

const yesButtonDisabled = new ActionRowBuilder()
    .addComponents(new ButtonBuilder()
    .setCustomId('yes_disabled')
    .setLabel('Yes')
    .setStyle(ButtonStyle.Success)
    .setDisabled(true)
    );

const noButtonDisabled = new ActionRowBuilder()
    .addComponents(new ButtonBuilder()
    .setCustomId('no_disabled')
    .setLabel('No')
    .setStyle(ButtonStyle.Danger)
    .setDisabled(true)
    );

const continueButton = new ActionRowBuilder()
    .addComponents(new ButtonBuilder()
        .setCustomId('continue')
        .setLabel('Continue')
        .setStyle(ButtonStyle.Primary)
    );

//Select the frequency of updates for the option
const frequencySelect = new ActionRowBuilder()
    .addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('frequency_select')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Never')
                    .setValue('never'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Daily')
                    .setValue('daily'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Weekly')
                    .setValue('weekly'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Monthly')
                    .setValue('monthly')
            )
    );

//#endregion

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Will setup the bot for use'),
    async execute(interaction) {
        //Authenticate the user
        await authenticate(interaction);

        //Ensures that the user who sent the command is the only one who can interact with the buttons
        const collectorFilter = i => i.user.id === interaction.user.id;

        const userData = await Utility.getDiscordUserData(interaction);
        const signInResult = await firestore.signIn(userData.email, userData.password);
        if (signInResult.success) {
            const uid = signInResult.value.user.uid;

            const isSetupComplete = await firestore.isSetupComplete(uid);
            if (isSetupComplete) {
                await interaction.followUp({ content: 'Setup has already been completed. Run the `/signout` command to redo the setup', components: [], flags: MessageFlags.Ephemeral });
                return;
            }

            var response = await interaction.followUp({
                embeds: [Utility.createSimpleEmbed('Welcome To Eve Catalyst',
                    'A number of prompts will appear that will help you determine how you would like the app to function in your server.' +
                    '\n\nWhen you are ready, please select the `Continue` button. Or simply dismiss this message to cancel.')], components: [continueButton], flags: MessageFlags.Ephemeral
            });

            try {
                var confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 300_000 });

                if (confirmation.customId === 'continue') {
                    confirmation.update({ content: 'Starting setup...', components: [] });

                    //Ask if the user would like to setup moon extraction notifications and to which channels
                    await optionSelect(interaction, collectorFilter, Options.MoonExtraction, false, uid);

                    //Ask if the user would like to setup mining ledger notifications and to which channels
                    await optionSelect(interaction, collectorFilter, Options.MiningLedger, false, uid);

                    //Ask if the user would like to setup Sov map notifications, to which channels and the frequency of updates
                    await optionSelect(interaction, collectorFilter, Options.SovMap, true, uid);

                    //Ask if the user would like to setup monthly economic reports and to which channels
                    await optionSelect(interaction, collectorFilter, Options.MonthlyEconomicReports, false, uid);

                    await firestore.updateDoc('users', uid, { setup_complete: true });

                    await firestore.signOut();

                    //Send embed message containing all the options the user has selected
                    interaction.followUp({ embeds: [await createSetupCompleteEmbed(interaction)] });
                }
            } catch (error) {
                console.error(error);
                return;
            }
        }

    }
};

//This function will modify the messageInfo object and return it
//Acts as a helper function to run through the various selections for each option
async function optionSelect(interaction, collectorFilter, option, selectFrequency, uid) {
    var text = 'Would you like to setup ' + option.text + '?';
    var response = await interaction.followUp({ content: text, components: [notificationSelect], flags: MessageFlags.Ephemeral });

    var optionEnabled = false;
    var optionFrequency = 'undefined';
    var channelIDs = [];

    try {
        const enableConfirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
        

        //If the user selects yes, ask which channels they would like to send the notifications to
        if (enableConfirmation.customId === yesID) {
            optionEnabled = true;
            enableConfirmation.update({ content: text, components: [yesButtonDisabled], flags: MessageFlags.Ephemeral });

            response = await interaction.followUp({ content: 'Which channels would you like to send ' + option.text + ' to?', components: [channelSelect], flags: MessageFlags.Ephemeral });

            const channelConfirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

            //const channelNames = confirmation.values.map(id => interaction.guild.channels.cache.get(id).name);
            channelIDs = channelConfirmation.values;


            console.log(channelConfirmation);
            channelConfirmation.update({ content: text + "\n\n" + channelIDs.map(id => `<#${id}>`).join(", "), components: [], flags: MessageFlags.Ephemeral });

            //Ask the user how often they would like to receive updates if the option is available
            if (selectFrequency) {
                response = await interaction.followUp({ content: 'How often would you like to receive ' + option.text + ' updates?', components: [frequencySelect], flags: MessageFlags.Ephemeral });
                const frequencyConfirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

                //messageInfo.text += '\n\t* ' + option.text + ' updates `' + confirmation.values[0] + '`';
                optionFrequency = frequencyConfirmation.values[0];

                //interaction.editReply({ content: messageInfo.text, flags: MessageFlags.Ephemeral });
                frequencyConfirmation.update({ content: text + "\n\n`" + optionFrequency + "`", components: [], flags: MessageFlags.Ephemeral });
            }
        } else if (enableConfirmation.customId === noID) {
            enableConfirmation.update({ content: text, components: [noButtonDisabled], flags: MessageFlags.Ephemeral });
        }

        //Update the user's settings in Firestore
        await firestore.updateDoc('users', uid, { [option.key]: optionEnabled, [option.key + "_channels"]: channelIDs, [option.key + '_frequency']: optionFrequency });

    } catch (error) {
        console.error(error);
        await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [], flags: MessageFlags.Ephemeral });

    };
}

