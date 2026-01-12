const { PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'setvrchat',
    description: 'Set VRChat URL',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        if (!args[0]) return;
        await db.set('vrchat_url', args[0]);
        message.reply("✅ URL Saved.");
    }
};