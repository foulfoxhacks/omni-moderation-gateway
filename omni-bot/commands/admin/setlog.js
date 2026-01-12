const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'setlog',
    description: 'Configure logging channels',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const type = args[0]?.toLowerCase();
        const channel = message.mentions.channels.first();

        const validTypes = [
            'mod', 'role', 'voice', 'channel', 'member', 
            'transcript', 'app_pending', 'app_history', 'scrub', 'health'
        ];

        if (!type || !channel || !validTypes.includes(type)) {
            const embed = new EmbedBuilder()
                .setTitle("📝 Logging Configuration")
                .setDescription("Usage: `!setlog <type> #channel`\n\n**Valid Types:**")
                .addFields(
                    { name: 'mod', value: 'Bans, Kicks, Msg Deletes', inline: true },
                    { name: 'role', value: 'Role Changes', inline: true },
                    { name: 'voice', value: 'VC Joins/Leaves', inline: true },
                    { name: 'channel', value: 'Channel Updates', inline: true },
                    { name: 'member', value: 'Joins/Leaves/Invites', inline: true },
                    { name: 'transcript', value: 'Ticket Transcripts', inline: true },
                    { name: 'app_pending', value: 'New Applications', inline: true },
                    { name: 'app_history', value: 'Accepted/Denied Apps', inline: true },
                    { name: 'scrub', value: 'Username AutoMod', inline: true },
                    { name: 'health', value: 'Bot Errors/Startup', inline: true }
                )
                .setColor(0x5865F2);
            return message.reply({ embeds: [embed] });
        }

        // Save to DB: log_CONFIG_GUILDID
        await db.set(`log_${type}_${message.guild.id}`, channel.id);
        message.reply(`✅ **${type}** logs will now be sent to ${channel}.`);
    }
};