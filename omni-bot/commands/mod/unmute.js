const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'unmute',
    description: 'Remove timeout from user',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return;
        
        const target = message.mentions.members.first();
        if (!target) return message.reply("Usage: `!unmute @User`");

        if (!target.isCommunicationDisabled()) return message.reply("User is not muted.");

        await target.timeout(null); // Setting to null removes timeout
        message.reply({ embeds: [new EmbedBuilder().setDescription(`🔊 **${target.user.tag}** has been unmuted.`).setColor(0x2ECC71)] });
    }
};