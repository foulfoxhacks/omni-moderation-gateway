const { PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'addcmd',
    description: 'Add a custom command: !addcmd <trigger> <response>',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return;

        const trigger = args[0];
        const response = args.slice(1).join(' ');

        if (!trigger || !response) return message.reply("Usage: `!addcmd wifi 12345`");

        await db.push(`cc_${message.guild.id}`, { trigger: trigger.toLowerCase(), response });
        message.reply(`✅ Added command **${trigger}**.`);
    }
};