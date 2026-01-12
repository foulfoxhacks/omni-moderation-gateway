const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'ban',
    description: 'Bans a user',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return;
        const target = message.mentions.members.first();
        if(target) {
            await target.ban();
            message.reply({ embeds: [new EmbedBuilder().setDescription(`🔨 **${target.user.tag}** was banned.`).setColor(0xE74C3C)] });
        }
    }
};