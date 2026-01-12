const { PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'setsuggest',
    description: 'Set suggestion channel',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        const channel = message.mentions.channels.first() || message.channel;
        await db.set(`guild_${message.guild.id}_suggest_ch`, channel.id);
        message.reply(`✅ Suggestions linked to ${channel}.`);
    }
};