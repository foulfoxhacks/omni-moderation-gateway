const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'unban',
    description: 'Unban a user by ID',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return;
        
        const userId = args[0];
        if (!userId) return message.reply("Usage: `!unban <UserID>`");

        try {
            await message.guild.members.unban(userId);
            message.reply({ embeds: [new EmbedBuilder().setDescription(`✅ User **${userId}** unbanned.`).setColor(0x2ECC71)] });
        } catch (e) {
            message.reply("User not found or not banned.");
        }
    }
};