const { PermissionFlagsBits, ChannelType } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'setuphub',
    description: 'Create a Join-to-Create voice channel',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const cat = await message.guild.channels.create({ name: '🔊 Voice Hub', type: ChannelType.GuildCategory });
        const ch = await message.guild.channels.create({ name: '➕ Join to Create', type: ChannelType.GuildVoice, parent: cat.id });

        await db.set(`tempvoice_hub_${message.guild.id}`, ch.id);
        message.reply("✅ **Voice Hub Created.** Join the channel to test it.");
    }
};