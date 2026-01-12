const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'stream',
    description: 'Manage stream notifications',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return;

        const sub = args[0]; // add, remove, list
        const platform = args[1]?.toLowerCase(); // twitch, youtube, kick

        if (sub === 'list') {
            const twitch = await db.get('stream_twitch') || [];
            const yt = await db.get('stream_yt') || [];
            const kick = await db.get('stream_kick') || [];

            const embed = new EmbedBuilder()
                .setTitle("📡 Tracked Streamers")
                .setColor(0x5865F2)
                .addFields(
                    { name: 'Twitch', value: twitch.map(t => `• ${t.username} -> <#${t.channelId}>`).join('\n') || "None" },
                    { name: 'Kick', value: kick.map(k => `• ${k.username} -> <#${k.channelId}>`).join('\n') || "None" },
                    { name: 'YouTube', value: yt.map(y => `• ${y.id} -> <#${y.channelId}>`).join('\n') || "None" }
                );
            return message.reply({ embeds: [embed] });
        }

        if (!sub || !platform) return message.reply("Usage: `!stream <add|remove|list> <twitch|kick|youtube> <User/ID> <#Channel> [@Role]`");

        // Determine DB Key
        let key;
        if (platform === 'twitch') key = 'stream_twitch';
        else if (platform === 'youtube') key = 'stream_yt';
        else if (platform === 'kick') key = 'stream_kick';
        else return message.reply("Invalid platform. Use: twitch, kick, youtube");
        
        if (sub === 'add') {
            const target = args[2]; // Username or ID
            const channel = message.mentions.channels.first();
            const role = message.mentions.roles.first();

            if (!target || !channel) return message.reply("Missing user/id or channel.");

            // Add to Database
            await db.push(key, {
                id: target,         
                username: target,   
                channelId: channel.id,
                roleId: role ? role.id : null
            });

            message.reply(`✅ Added **${target}** to ${platform} alerts in ${channel}.`);
        }

        if (sub === 'remove') {
            const target = args[2];
            const current = await db.get(key) || [];
            // Filter out the target
            const filtered = current.filter(c => c.username !== target && c.id !== target);
            await db.set(key, filtered);
            message.reply(`🗑️ Removed **${target}** from ${platform} alerts.`);
        }
    }
};