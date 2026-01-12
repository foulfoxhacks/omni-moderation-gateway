const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'purge',
    description: 'Bulk delete messages',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;
        
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply("Usage: `!purge <1-100>`");
        }

        // Delete messages (filter old ones automatically)
        await message.channel.bulkDelete(amount, true).catch(err => {
            message.reply("Error: I cannot delete messages older than 14 days.");
        });

        const msg = await message.channel.send(`🧹 Cleared **${amount}** messages.`);
        setTimeout(() => msg.delete().catch(()=>{}), 3000);
    }
};