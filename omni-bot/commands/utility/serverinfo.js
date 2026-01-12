const { EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    name: 'serverinfo',
    description: 'Display server stats',
    async execute(message, args) {
        const { guild } = message;
        const owner = await guild.fetchOwner();
        
        const embed = new EmbedBuilder()
            .setTitle(guild.name)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setColor(0x5865F2)
            .addFields(
                { name: '👑 Owner', value: owner.user.tag, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
                { name: '💬 Channels', value: `${guild.channels.cache.size}`, inline: true },
                { name: '🔐 Roles', value: `${guild.roles.cache.size}`, inline: true },
                { name: '🚀 Boosts', value: `${guild.premiumSubscriptionCount || 0}`, inline: true }
            )
            .setFooter({ text: `ID: ${guild.id}` });

        message.reply({ embeds: [embed] });
    }
};