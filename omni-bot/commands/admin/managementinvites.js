const { PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'manageinvites',
    description: 'Add or Remove bonus invites',
    async execute(message, args) {
        // Usage: !manageinvites add @User 5
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const action = args[0]; // 'add' or 'remove'
        const target = message.mentions.users.first();
        const amount = parseInt(args[2]);

        if (!target || isNaN(amount) || (action !== 'add' && action !== 'remove')) {
            return message.reply("Usage: `!manageinvites <add|remove> @User <amount>`");
        }

        const key = `invites_${message.guild.id}_${target.id}`;
        const data = await db.get(key) || { joins: 0, leaves: 0, bonus: 0 };

        if (action === 'add') data.bonus += amount;
        if (action === 'remove') data.bonus -= amount;

        await db.set(key, data);
        message.reply(`✅ Updated **${target.tag}**. Bonus Invites: ${data.bonus}`);
    }
};