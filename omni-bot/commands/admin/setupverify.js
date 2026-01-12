const { PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require('quick.db');
const Captcha = require('../../systems/captcha');
const db = new QuickDB();

module.exports = {
    name: 'setupverify',
    description: 'Setup verification system',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        const role = message.mentions.roles.first();
        if (!role) return message.reply("Usage: `!setupverify @Role`");

        await db.set(`guild_${message.guild.id}_verify_role`, role.id);
        await Captcha.sendDiscordPanel(message.channel);
        message.delete().catch(()=>{});
    }
};