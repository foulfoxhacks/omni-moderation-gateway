const { PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'setxp',
    description: 'Set the channel for Level Up announcements',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        
        const channel = message.mentions.channels.first() || message.channel;
        
        // Save to DB
        await db.set(`guild_${message.guild.id}_xp_ch`, channel.id);
        
        message.reply(`✅ Level-up messages will now be sent to ${channel}.`);
    }
};