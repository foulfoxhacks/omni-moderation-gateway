const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'leaderboard',
    description: 'Show XP Leaderboard',
    async execute(message, args) {
        // Fetch all data
        const allData = await db.all();
        
        // Filter for this guild's XP keys: "xp_GUILDID_USERID"
        const prefix = `xp_${message.guild.id}_`;
        
        const sorted = allData
            .filter(entry => entry.id.startsWith(prefix)) // Only this server
            .sort((a, b) => b.value - a.value) // Sort highest to lowest
            .slice(0, 10); // Get top 10

        if (sorted.length === 0) return message.reply("No XP data yet.");

        const embed = new EmbedBuilder()
            .setTitle(`🏆 ${message.guild.name} Leaderboard`)
            .setColor(0xF1C40F);

        let desc = "";
        for (let i = 0; i < sorted.length; i++) {
            const userId = sorted[i].id.split('_')[2];
            const xp = sorted[i].value;
            const level = Math.floor(0.1 * Math.sqrt(xp));
            
            // Try to fetch user (might not be cached)
            // We use <@ID> so it pings/shows name even if not cached
            desc += `**#${i + 1}** <@${userId}> — LVL **${level}** (${xp} XP)\n`;
        }

        embed.setDescription(desc);
        message.reply({ embeds: [embed] });
    }
};