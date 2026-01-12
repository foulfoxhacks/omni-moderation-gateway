const { PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    name: 'move',
    description: 'Move user to voice channel',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.MoveMembers)) return;
        const target = message.mentions.members.first();
        const chId = args[1];

        if (!target || !chId) return message.reply("Usage: `!move @user <ChannelID>`");
        if (!target.voice.channel) return message.reply("User not in voice.");

        const ch = await message.guild.channels.fetch(chId);
        if (ch && ch.type === ChannelType.GuildVoice) {
            await target.voice.setChannel(ch);
            message.reply("✅ Moved.");
        } else {
            message.reply("Invalid Channel.");
        }
    }
};