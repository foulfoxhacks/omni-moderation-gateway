const { PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'setwelcome',
    description: 'Set the welcome channel',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        
        const channel = message.mentions.channels.first() || message.channel;
        await db.set(`guild_${message.guild.id}_welcome_ch`, channel.id);
        
        message.reply(`✅ Welcome images will now appear in ${channel}.`);
    }
};