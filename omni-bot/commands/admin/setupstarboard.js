const { PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'setupstarboard',
    description: 'Configure starboard',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const channel = message.mentions.channels.first();
        const count = parseInt(args[1]) || 3;

        if (!channel) return message.reply("Usage: `!setupstarboard #channel <threshold>`");

        await db.set(`starboard_${message.guild.id}`, { channelId: channel.id, threshold: count });
        message.reply(`✅ Starboard set to ${channel} with **${count}** star requirement.`);
    }
};