const { PermissionFlagsBits, ChannelType } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'setupstats',
    description: 'Create stats channel',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        
        const ch = await message.guild.channels.create({
            name: `👥 Members: ${message.guild.memberCount}`,
            type: ChannelType.GuildVoice,
            permissionOverwrites: [{ id: message.guild.id, deny: [PermissionFlagsBits.Connect] }]
        });

        await db.set(`guild_${message.guild.id}_stats_ch`, ch.id);
        message.reply("✅ Stats channel created. It will update every 10 mins.");
    }
};