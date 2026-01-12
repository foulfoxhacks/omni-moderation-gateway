const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'disconnect',
    description: 'Kick a user from a Voice Channel',
    async execute(message, args) {
        // 1. Permission Check
        if (!message.member.permissions.has(PermissionFlagsBits.MoveMembers)) {
            return message.reply("⛔ Missing Permission: MOVE_MEMBERS");
        }

        const target = message.mentions.members.first();
        const reason = args.slice(1).join(" ") || "No reason provided";

        // 2. Validation
        if (!target) return message.reply("Usage: `!disconnect @User [Reason]`");
        if (!target.voice.channel) return message.reply("❌ That user is not currently in a voice channel.");

        // 3. Hierarchy Check (Prevent disconnecting admins)
        if (target.roles.highest.position >= message.member.roles.highest.position && message.author.id !== message.guild.ownerId) {
            return message.reply("❌ You cannot disconnect this user (They have a higher or equal role).");
        }

        try {
            const channelName = target.voice.channel.name;
            
            // 4. Execution (Move to null = Disconnect)
            await target.voice.disconnect(reason);

            // 5. Log/Reply
            const embed = new EmbedBuilder()
                .setTitle("🔌 User Disconnected")
                .setDescription(`**Target:** ${target.user.tag}\n**From:** ${channelName}\n**Moderator:** ${message.author.tag}\n**Reason:** ${reason}`)
                .setColor(0xE74C3C) // Red
                .setTimestamp();

            message.reply({ embeds: [embed] });

        } catch (e) {
            console.error(e);
            message.reply("❌ Failed to disconnect user. I may not have permission to moderate them.");
        }
    }
};