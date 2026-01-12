const { ChannelType, PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    async handleVoiceUpdate(oldState, newState) {
        const guild = newState.guild;
        
        // 1. Get Hub Channel ID
        const hubId = await db.get(`tempvoice_hub_${guild.id}`);
        if (!hubId) return;

        // 2. USER JOINS HUB -> CREATE CHANNEL
        if (newState.channelId === hubId) {
            const category = newState.channel.parent;
            
            const tempChannel = await guild.channels.create({
                name: `${newState.member.user.username}'s VC`,
                type: ChannelType.GuildVoice,
                parent: category ? category.id : null,
                permissionOverwrites: [
                    { id: newState.member.id, allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers] }
                ]
            });

            // Move user
            await newState.setChannel(tempChannel);

            // Register in DB so we know to delete it later
            await db.push(`temp_channels_${guild.id}`, tempChannel.id);
        }

        // 3. USER LEAVES CHANNEL -> CHECK EMPTY
        if (oldState.channelId && oldState.channelId !== hubId) {
            const tempChannels = await db.get(`temp_channels_${guild.id}`) || [];
            
            if (tempChannels.includes(oldState.channelId)) {
                const channel = oldState.channel;
                if (channel && channel.members.size === 0) {
                    await channel.delete().catch(() => {});
                    // Remove from DB (Filter out deleted ID)
                    const newStats = tempChannels.filter(id => id !== oldState.channelId);
                    await db.set(`temp_channels_${guild.id}`, newStats);
                }
            }
        }
    }
};