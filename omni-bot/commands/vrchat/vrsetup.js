const { PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'vrsetup',
    description: 'Configure VRChat Group settings',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const sub = args[0]; // channel, role
        const target = message.mentions.channels.first() || message.mentions.roles.first();

        if (sub === 'channel' && target) {
            await db.set(`vrc_channel_${message.guild.id}`, target.id);
            return message.reply(`✅ VRChat Announcements will post to ${target}.`);
        }

        if (sub === 'role' && target) {
            await db.set(`vrc_role_${message.guild.id}`, target.id);
            return message.reply(`✅ VRChat Announcements will ping **${target.name}**.`);
        }

        message.reply("Usage: `!vrsetup channel #channel` or `!vrsetup role @Role`");
    }
};