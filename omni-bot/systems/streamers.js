const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const axios = require('axios');
const Parser = require('rss-parser');
const db = new QuickDB();
const rss = new Parser();

// Cache to prevent duplicate pings
const liveCache = new Set(); 

module.exports = {
    // ============================
    // 1. TWITCH HANDLER
    // ============================
    async checkTwitch(client) {
        const configs = await db.get('stream_twitch') || [];
        if (configs.length === 0) return;

        // Get Token
        let token = await db.get('twitch_token');
        if (!token) {
            try {
                const res = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`);
                token = res.data.access_token;
                await db.set('twitch_token', token);
            } catch (e) { return; }
        }

        for (const config of configs) {
            try {
                const response = await axios.get(`https://api.twitch.tv/helix/streams?user_login=${config.username}`, {
                    headers: { 'Client-ID': process.env.TWITCH_CLIENT_ID, 'Authorization': `Bearer ${token}` }
                });

                const stream = response.data.data[0];
                if (stream && stream.type === 'live') {
                    if (!liveCache.has(`twitch_${config.username}`)) {
                        liveCache.add(`twitch_${config.username}`);
                        this.sendNotification(client, config, stream, 'twitch');
                    }
                } else {
                    liveCache.delete(`twitch_${config.username}`);
                }
            } catch (e) {
                if (e.response?.status === 401) await db.delete('twitch_token');
            }
        }
    },

    // ============================
    // 2. YOUTUBE HANDLER
    // ============================
    async checkYouTube(client) {
        const configs = await db.get('stream_yt') || [];
        for (const config of configs) {
            try {
                const feed = await rss.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${config.id}`);
                if (!feed.items.length) continue;

                const latest = feed.items[0];
                const lastId = await db.get(`yt_last_${config.id}`);

                if (lastId !== latest.id) {
                    await db.set(`yt_last_${config.id}`, latest.id);
                    this.sendNotification(client, config, latest, 'youtube');
                }
            } catch (e) {}
        }
    },

    // ============================
    // 3. KICK HANDLER (New)
    // ============================
    async checkKick(client) {
        const configs = await db.get('stream_kick') || [];
        for (const config of configs) {
            try {
                // Unofficial Kick API v1
                const res = await axios.get(`https://kick.com/api/v1/channels/${config.username}`, {
                    headers: { 
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });
                
                const data = res.data;
                
                // Check if livestream object exists and is active
                if (data && data.livestream && data.livestream.is_live) {
                    if (!liveCache.has(`kick_${config.username}`)) {
                        liveCache.add(`kick_${config.username}`);
                        this.sendNotification(client, config, data, 'kick');
                    }
                } else {
                    liveCache.delete(`kick_${config.username}`);
                }
            } catch (e) {
                // Kick often blocks bots with 403/429. We ignore errors to keep bot stable.
            }
        }
    },

    // ============================
    // 4. NOTIFICATION SENDER
    // ============================
    async sendNotification(client, config, data, platform) {
        const channel = client.channels.cache.get(config.channelId);
        if (!channel) return;

        let content = "";
        let embed = new EmbedBuilder();

        // Add Role Ping if configured
        if (config.roleId) content += `<@&${config.roleId}> `;

        if (platform === 'twitch') {
            content += `🟣 **${data.user_name} is LIVE on Twitch!**`;
            embed.setTitle(data.title)
                .setURL(`https://twitch.tv/${data.user_name}`)
                .setDescription(`Playing: ${data.game_name}`)
                .setColor(0x9146FF)
                .setImage(data.thumbnail_url.replace('{width}', '640').replace('{height}', '360') + `?t=${Date.now()}`)
                .setTimestamp();
        } 
        else if (platform === 'kick') {
            content += `💚 **${data.user.username} is LIVE on Kick!**`;
            embed.setTitle(data.livestream.session_title)
                .setURL(`https://kick.com/${data.slug}`)
                .setDescription(`Category: ${data.livestream.categories[0]?.name || 'Unknown'}`)
                .setColor(0x53FC18)
                .setImage(data.livestream.thumbnail.url + `?t=${Date.now()}`)
                .setTimestamp();
        }
        else if (platform === 'youtube') {
            content += `🔴 **New Upload/Stream from ${data.author}!**`;
            embed.setTitle(data.title)
                .setURL(data.link)
                .setColor(0xFF0000)
                .setImage(`https://img.youtube.com/vi/${data.id.split(':')[2]}/maxresdefault.jpg`)
                .setTimestamp();
        }

        await channel.send({ content: content, embeds: [embed] });
    }
};