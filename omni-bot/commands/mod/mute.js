const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'mute',
    description: 'Timeout a user',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return;
        const target = message.mentions.members.first();
        const mins = parseInt(args[1]);
        
        if (!target || isNaN(mins)) return message.reply("Usage: `!mute @user <mins>`");
        
        await target.timeout(mins * 60 * 1000, args.slice(2).join(" "));
        message.reply({ embeds: [new EmbedBuilder().setTitle("🤐 Muted").setDescription(`${target.user.tag} for ${mins}m`).setColor(0xF1C40F)] });
    }
};