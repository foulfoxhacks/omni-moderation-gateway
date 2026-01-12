const { PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'addadminrole',
    description: 'Authorize role for bot restart',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        const role = message.mentions.roles.first();
        if (!role) return;

        await db.push('admin_roles', role.id);
        message.reply(`✅ Role ${role.name} authorized for bot commands.`);
    }
};