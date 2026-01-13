const { PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'setfeedback',
    description: 'Set channel for receiving user feedback',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const channel = message.mentions.channels.first() || message.channel;
        await db.set(`guild_${message.guild.id}_feedback_ch`, channel.id);

        message.reply(`✅ User feedback will be sent to ${channel}.`);
    }
};