const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'slowmode',
    description: 'Set channel cooldown',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return;

        const seconds = parseInt(args[0]);
        if (isNaN(seconds)) return message.reply("Usage: `!slowmode <seconds>` (0 to disable)");

        await message.channel.setRateLimitPerUser(seconds);
        message.reply(`🐢 Slowmode set to **${seconds} seconds**.`);
    }
};