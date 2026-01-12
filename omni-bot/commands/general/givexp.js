const { PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'givexp',
    description: 'Admin: Add XP to user',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const target = message.mentions.users.first();
        const amount = parseInt(args[1]);

        if (!target || isNaN(amount)) return message.reply("Usage: `!givexp @User 500`");

        await db.add(`xp_${message.guild.id}_${target.id}`, amount);
        message.reply(`✅ Added **${amount} XP** to ${target.tag}.`);
    }
};