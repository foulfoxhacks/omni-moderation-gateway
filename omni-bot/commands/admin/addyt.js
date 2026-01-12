const { PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'addyt',
    description: 'Add YouTube notification',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        const ytId = args[0];
        const ch = message.mentions.channels.first();

        if (!ytId || !ch) return message.reply("Usage: `!addyt <Channel_ID> #channel`");

        await db.push('yt_configs', { ytId: ytId, chId: ch.id, guildId: message.guild.id });
        message.reply("✅ YouTube RSS added.");
    }
};