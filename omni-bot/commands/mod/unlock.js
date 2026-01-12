const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'unlock',
    description: 'Unlock current channel',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return;

        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
            SendMessages: true
        });

        const embed = new EmbedBuilder()
            .setTitle("🔓 Channel Unlocked")
            .setDescription("You may speak now.")
            .setColor(0x2ECC71);
        message.channel.send({ embeds: [embed] });
    }
};