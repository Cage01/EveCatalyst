const { ActionRowBuilder, SlashCommandBuilder, ChannelSelectMenuBuilder, ChannelType, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { authenticate } = require("../../interactions/index.js");
require('dotenv').config()


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
    )


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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Will setup the bot for use'),
    async execute(interaction) {
        //Authenticate the user
        var messageInfo = { text: await authenticate(interaction), optionCounter: 0, selectFrequency: false };


        //var response = await interaction.followUp({ content: 'Would you like to setup moon extraction notifications?', components: [notificationSelect] });


        //Ensures that the user who sent the command is the only one who can interact with the buttons
        const collectorFilter = i => i.user.id === interaction.user.id;


        messageInfo = await optionSelect(interaction, collectorFilter, messageInfo, 'Moon Extraction notifications');

        //TODO: Ask if the user would like to setup mining ledger notifications and to which channels
        messageInfo = await optionSelect(interaction, collectorFilter, messageInfo, 'Mining Ledger notifications');

        //TODO: Ask if the user would like to setup Sov map notifications, to which channels and the frequency of updates
        messageInfo.selectFrequency = true;
        messageInfo = await optionSelect(interaction, collectorFilter, messageInfo, 'Sov Map notifications');

        //TODO: Ask if the user would like to setup monthly economic reports and to which channels
        messageInfo.selectFrequency = false;
        messageInfo = await optionSelect(interaction, collectorFilter, messageInfo, 'Monthly Economic Reports');

        messageInfo.text += '\n━━━━━━━━━━\n\nThese options can be updated at any time with the associate commands. Run `/help` to see more.\n\nSetup complete';
        interaction.editReply({ content: messageInfo.text, components: [] });

        //TODO: Update the user's settings in the database


    }
};

async function optionSelect(interaction, collectorFilter, messageInfo, optionText) {
    var response = await interaction.followUp({ content: 'Would you like to setup ' + optionText + '?', components: [notificationSelect] });

    try {
        var confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

        if (confirmation.customId === yesID) {
            await response.delete();
``
            messageInfo.text += '\n' + messageInfo.optionCounter++ + '. ' + optionText + ' `enabled`';
            interaction.editReply({ content: messageInfo.text });

            response = await interaction.followUp({ content: 'Which channels would you like to send ' + optionText + ' to?', components: [channelSelect] });

            confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

            const channelNames = confirmation.values.map(id => interaction.guild.channels.cache.get(id).name);
            messageInfo.text += '\n\t* ' + optionText + ' sending to `' + channelNames.join(', ') + '`';
            interaction.editReply({ content: messageInfo.text });

            console.log(confirmation);
            await response.delete();

            if (messageInfo.selectFrequency) {
                response = await interaction.followUp({ content: 'How often would you like to receive ' + optionText + ' updates?', components: [frequencySelect] });
                confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
                
                messageInfo.text += '\n\t* ' + optionText + ' updates `' + confirmation.values[0] + '`';
                interaction.editReply({ content: messageInfo.text });
                await response.delete();
            }
        } else if (confirmation.customId === noID) {
            await response.delete();

            messageInfo.text += '\n' + messageInfo.optionCounter++ + '. ' + optionText + ' `disabled`';
            await interaction.editReply({ content: messageInfo.text, components: [] });
        }
    } catch (error) {
        console.error(error);
        await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });

    }

    return messageInfo;
}