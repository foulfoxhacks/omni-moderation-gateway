const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    async handleReaction(reaction, user) {
        if (reaction.emoji.name !== '⭐') return;
        if (user.bot) return;

        // Fetch config
        const guildId = reaction.message.guild.id;
        const config = await db.get(`starboard_${guildId}`); 
        // Config structure: { channelId: '123', threshold: 3 }
        
        if (!config || !config.channelId) return;

        // Fetch full message if partial
        if (reaction.partial) {
            try { await reaction.fetch(); } catch (error) { return; }
        }

        // Check count
        if (reaction.count < config.threshold) return;

        // Check if already posted
        const existingId = await db.get(`star_msg_${reaction.message.id}`);
        if (existingId) return; // Already on starboard

        const starChannel = reaction.message.guild.channels.cache.get(config.channelId);
        if (!starChannel) return;

        const msg = reaction.message;
        const image = msg.attachments.size > 0 ? msg.attachments.first().url : null;

        const embed = new EmbedBuilder()
            .setAuthor({ name: msg.author.tag, iconURL: msg.author.displayAvatarURL() })
            .setDescription(msg.content || "[Image/Media]")
            .setColor(0xF1C40F)
            .addFields({ name: 'Source', value: `[Jump to Message](${msg.url})` })
            .setFooter({ text: `ID: ${msg.id}` })
            .setTimestamp();

        if (image) embed.setImage(image);

        const starMsg = await starChannel.send({ content: `⭐ **${reaction.count}** | ${msg.channel}`, embeds: [embed] });
        
        // Save to avoid duplicates
        await db.set(`star_msg_${msg.id}`, starMsg.id);
    }
};