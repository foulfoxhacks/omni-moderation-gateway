const { PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'panels',
    description: 'Send Ticket/App panels',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        const type = args[0]; // 'ticket' or 'app'

        if (type === 'ticket') {
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket_create').setLabel('Open Ticket').setStyle(ButtonStyle.Primary).setEmoji('📩'));
            await message.channel.send({ content: "**Support Tickets**\nClick below to open.", components: [row] });
        } else if (type === 'app') {
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('app_start').setLabel('Apply Now').setStyle(ButtonStyle.Success));
            await message.channel.send({ content: "**Furlink Community Member Applications**\nClick below to apply.", components: [row] });
        } else {
            message.reply("Usage: `!panels ticket` or `!panels app`");
        }
    }
};