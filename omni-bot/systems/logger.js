const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    // Helper to get channel
    async send(guild, type, embed) {
        const chId = await db.get(`log_${type}_${guild.id}`);
        if (!chId) return;
        const channel = guild.channels.cache.get(chId);
        if (channel) channel.send({ embeds: [embed] }).catch(() => {});
    },

    // --- MESSAGE EVENTS (Mod Logs) ---
    async onMessageDelete(message) {
        if (message.author?.bot) return;
        const embed = new EmbedBuilder()
            .setTitle("🗑️ Message Deleted")
            .setDescription(`**Author:** ${message.author}\n**Channel:** ${message.channel}\n**Content:** ${message.content || '[Media]'}`)
            .setColor(0xE74C3C).setTimestamp();
        this.send(message.guild, 'mod', embed);
    },

    async onMessageUpdate(oldM, newM) {
        if (oldM.author?.bot || oldM.content === newM.content) return;
        const embed = new EmbedBuilder()
            .setTitle("✏️ Message Edited")
            .setDescription(`**Author:** ${oldM.author}\n**Channel:** ${oldM.channel}\n[Jump](${newM.url})`)
            .addFields({ name: 'Before', value: oldM.content.substring(0,1024) }, { name: 'After', value: newM.content.substring(0,1024) })
            .setColor(0xF1C40F).setTimestamp();
        this.send(newM.guild, 'mod', embed);
    },

    // --- CHANNEL EVENTS ---
    async onChannelCreate(c) {
        if(!c.guild) return;
        const embed = new EmbedBuilder().setTitle("📺 Channel Created").setDescription(`Name: **#${c.name}**\nType: ${c.type}`).setColor(0x2ECC71);
        this.send(c.guild, 'channel', embed);
    },
    async onChannelDelete(c) {
        if(!c.guild) return;
        const embed = new EmbedBuilder().setTitle("📺 Channel Deleted").setDescription(`Name: **#${c.name}**`).setColor(0xE74C3C);
        this.send(c.guild, 'channel', embed);
    },

    // --- ROLE EVENTS ---
    async onRoleCreate(r) {
        const embed = new EmbedBuilder().setTitle("🛡️ Role Created").setDescription(`Name: **${r.name}**`).setColor(0x2ECC71);
        this.send(r.guild, 'role', embed);
    },
    async onRoleDelete(r) {
        const embed = new EmbedBuilder().setTitle("🛡️ Role Deleted").setDescription(`Name: **${r.name}**`).setColor(0xE74C3C);
        this.send(r.guild, 'role', embed);
    },
    
    // --- MEMBER UPDATES (Roles/Nicknames) ---
    async onGuildMemberUpdate(oldM, newM) {
        // Role Changes
        const addedRoles = newM.roles.cache.filter(r => !oldM.roles.cache.has(r.id));
        const removedRoles = oldM.roles.cache.filter(r => !newM.roles.cache.has(r.id));

        if (addedRoles.size > 0 || removedRoles.size > 0) {
            let desc = `**User:** ${newM.user.tag}\n`;
            if (addedRoles.size > 0) desc += `**Added:** ${addedRoles.map(r=>r).join(', ')}\n`;
            if (removedRoles.size > 0) desc += `**Removed:** ${removedRoles.map(r=>r).join(', ')}`;
            
            const embed = new EmbedBuilder().setTitle("👤 Roles Updated").setDescription(desc).setColor(0x3498DB);
            this.send(newM.guild, 'role', embed);
        }

        // Nickname Changes (Scrubbing Logs potential)
        if (oldM.nickname !== newM.nickname) {
            const embed = new EmbedBuilder()
                .setTitle("🏷️ Nickname Changed")
                .setDescription(`**User:** ${newM.user.tag}\n**Old:** ${oldM.nickname || 'None'}\n**New:** ${newM.nickname || 'None'}`)
                .setColor(0x95A5A6);
            this.send(newM.guild, 'scrub', embed); // Sends to username-scrubbing-logs
        }
    },

    // --- VOICE LOGGING ---
    async onVoiceStateUpdate(oldS, newS) {
        const member = newS.member || oldS.member;
        if (member.user.bot) return;

        let action = "";
        let color = 0x95A5A6;

        if (!oldS.channelId && newS.channelId) {
            action = `joined voice channel **${newS.channel.name}**`;
            color = 0x2ECC71;
        } else if (oldS.channelId && !newS.channelId) {
            action = `left voice channel **${oldS.channel.name}**`;
            color = 0xE74C3C;
        } else if (oldS.channelId !== newS.channelId) {
            action = `moved from **${oldS.channel.name}** to **${newS.channel.name}**`;
            color = 0xF1C40F;
        } else {
            return; // Mute/Deafen toggle (ignore to prevent spam)
        }

        const embed = new EmbedBuilder()
            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
            .setDescription(`**${member.user.username}** ${action}.`)
            .setColor(color)
            .setTimestamp();
        
        this.send(member.guild, 'voice', embed);
    }
};