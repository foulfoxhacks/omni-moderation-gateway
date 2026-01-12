const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'close',
    description: 'Close your VRChat Instance',
    async execute(message, args) {
        const data = await db.get(`vrc_last_instance_${message.author.id}`);
        if (!data) return message.reply("❌ You don't have an active instance.");

        try {
            const channel = message.guild.channels.cache.get(data.channelId);
            const msg = await channel.messages.fetch(data.msgId);

            const oldEmbed = msg.embeds[0];
            const newEmbed = new EmbedBuilder(oldEmbed.data)
                .setTitle(`🔴 Instance Closed`)
                .setDescription(oldEmbed.description.replace('🟢 OPEN', '🔴 ENDED'))
                .setColor(0x2B2D31); // Grey

            await msg.edit({ content: "🔒 This instance has ended.", embeds: [newEmbed], components: [] });
            await db.delete(`vrc_last_instance_${message.author.id}`);
            
            message.reply("✅ Instance marked as closed.");
        } catch (e) {
            message.reply("❌ Could not find the announcement message.");
        }
    }
};