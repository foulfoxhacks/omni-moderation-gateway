const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'kick',
    description: 'Kick a user',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return;
        const target = message.mentions.members.first();
        if (!target) return message.reply("Mention someone.");
        if (!target.kickable) return message.reply("Cannot kick this user.");

        await target.kick(args.slice(1).join(" ") || "No reason");
        message.reply({ embeds: [new EmbedBuilder().setTitle("🥾 Kicked").setDescription(target.user.tag).setColor(0xF1C40F)] });
    }
};