const { QuickDB } = require('quick.db');
const db = new QuickDB();
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'bridge',
    description: 'Link channel to Telegram',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        if (!args[0]) return message.reply("Usage: `!bridge <TelegramChatID>`");
        
        await db.set(`bridge_d2t_${message.channel.id}`, args[0]);
        await db.set(`bridge_t2d_${args[0]}`, message.channel.id);
        message.reply(`✅ Bridge active. TG ID: ${args[0]}`);
    }
};