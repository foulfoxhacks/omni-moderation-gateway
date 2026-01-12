const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'userinfo',
    description: 'Get user details',
    async execute(message, args) {
        const target = message.mentions.members.first() || message.member;
        
        const embed = new EmbedBuilder()
            .setAuthor({ name: target.user.tag, iconURL: target.user.displayAvatarURL() })
            .setThumbnail(target.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setColor(target.displayHexColor)
            .addFields(
                { name: '🆔 ID', value: target.id, inline: true },
                { name: '📅 Joined Server', value: `<t:${Math.floor(target.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: '📅 Created Acc', value: `<t:${Math.floor(target.user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '🎭 Roles', value: target.roles.cache.map(r => r).join(' ').slice(0, 1024) || "None" }
            );

        message.reply({ embeds: [embed] });
    }
};