const { QuickDB } = require('quick.db');
const Parser = require('rss-parser');
const db = new QuickDB();
const rss = new Parser();

module.exports = {
    // ====================================================
    // 1. XP SYSTEM (Updated with !setxp support)
    // ====================================================
    async addXp(message) {
        if (message.author.bot) return;
        
        const key = `xp_${message.guild.id}_${message.author.id}`;
        
        // Get current stats
        const oldXp = await db.get(key) || 0;
        const xpToAdd = Math.floor(Math.random() * 10) + 10;
        const newXp = oldXp + xpToAdd;

        // Save new XP
        await db.set(key, newXp);

        // Check Level Up
        // Formula: Level = 0.1 * sqrt(XP)
        const oldLevel = Math.floor(0.1 * Math.sqrt(oldXp));
        const newLevel = Math.floor(0.1 * Math.sqrt(newXp));

        if (newLevel > oldLevel) {
            try {
                // Check if a specific channel is set via !setxp
                const xpChannelId = await db.get(`guild_${message.guild.id}_xp_ch`);
                let targetChannel = message.channel;

                if (xpChannelId) {
                    const fetchedCh = message.guild.channels.cache.get(xpChannelId);
                    if (fetchedCh) targetChannel = fetchedCh;
                }

                await targetChannel.send(`🎉 ${message.author} has reached **Level ${newLevel}**!`);
            } catch (e) {
                // Ignore permissions errors
            }
        }
    },

    // ====================================================
    // 2. STATS CHANNEL LOOP
    // ====================================================
    async updateStatsLoop(client) {
        client.guilds.cache.forEach(async (guild) => {
            const chId = await db.get(`guild_${guild.id}_stats_ch`);
            if (chId) {
                const ch = guild.channels.cache.get(chId);
                if (ch && ch.manageable) {
                    await ch.setName(`👥 Members: ${guild.memberCount}`).catch(() => {});
                }
            }
        });
    },

    // ====================================================
    // 3. YOUTUBE RSS LOOP
    // ====================================================
    async checkRSSLoop(client) {
        const configs = await db.get('yt_configs') || [];
        for (const config of configs) {
            try {
                const feed = await rss.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${config.ytId}`);
                if (!feed.items.length) continue;

                const latest = feed.items[0];
                const lastId = await db.get(`yt_last_${config.ytId}`);

                if (lastId !== latest.id) {
                    await db.set(`yt_last_${config.ytId}`, latest.id);
                    const channel = client.channels.cache.get(config.chId);
                    if (channel) {
                        await channel.send(`📢 **New Video from ${feed.title}!**\n${latest.link}`);
                    }
                }
            } catch (e) {}
        }
    },

    // ====================================================
    // 4. REMINDER SYSTEM LOOP
    // ====================================================
    async checkRemindersLoop(client) {
        const reminders = await db.get('reminders') || [];
        if (reminders.length === 0) return;

        const now = Date.now();
        const pending = [];
        let changed = false;
        
        for (const r of reminders) {
            if (r.due <= now) {
                try {
                    const channel = await client.channels.fetch(r.channelId);
                    if (channel) {
                        await channel.send(`⏰ <@${r.userId}> **Reminder:** ${r.note}`);
                    }
                } catch (e) {}
                changed = true; 
            } else {
                pending.push(r);
            }
        }

        if (changed) {
            await db.set('reminders', pending);
        }
    }
};