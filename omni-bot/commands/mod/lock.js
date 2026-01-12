const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'lock',
    description: 'Lock current channel',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return;

        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
            SendMessages: false
        });

        const embed = new EmbedBuilder()
            .setTitle("🔒 Channel Locked")
            .setDescription("Moderators have paused the chat.")
            .setColor(0xE74C3C);
        message.channel.send({ embeds: [embed] });
    }
};