const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus, VoiceConnectionStatus, NoSubscriberBehavior } = require('@discordjs/voice');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } = require('discord.js');
const play = require('play-dl'); 
const ytSearch = require('yt-search'); 
const fs = require('fs');
const path = require('path');

// --- 403 FIX: NETSCAPE .TXT COOKIE PARSER ---
async function setupCookies() {
    try {
        const cookiePath = path.join(__dirname, '../cookies.txt'); 
        
        if (fs.existsSync(cookiePath)) {
            const rawContent = fs.readFileSync(cookiePath, 'utf8');
            let cookieString = "";

            if (rawContent.includes('# Netscape')) {
                const lines = rawContent.split('\n');
                const parsedCookies = [];

                for (let line of lines) {
                    // Skip comments and empty lines
                    if (line.startsWith('#') || line.trim() === '') continue;
                    
                    const parts = line.split('\t');
                    if (parts.length >= 7) {
                        const domain = parts[0].trim();
                        // Only pull cookies relevant to YouTube/Google to keep headers clean
                        if (domain.includes('youtube.com') || domain.includes('google.com')) {
                            const name = parts[5].trim();
                            const value = parts[6].trim();
                            parsedCookies.push(`${name}=${value}`);
                        }
                    }
                }
                cookieString = parsedCookies.join('; ');
            } else {
                cookieString = rawContent.trim();
            }

            await play.setToken({
                youtube: {
                    cookie: cookieString
                }
            });
            console.log("✅ Music System: cookies.txt parsed and YouTube session authorized.");
        } else {
            console.warn("⚠️ Music System: cookies.txt not found! YouTube will likely block streams (403).");
        }
    } catch (err) {
        console.error("❌ Music System: Error loading cookies:", err);
    }
}
setupCookies();

const musicQueues = new Map();

module.exports = {
    async play(message, query) {
        const guildId = message.guild.id;
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply("❌ Join a voice channel first.");

        if (!musicQueues.has(guildId)) {
            const player = createAudioPlayer({
                behaviors: { noSubscriber: NoSubscriberBehavior.Play }
            });

            const contract = {
                connection: null,
                player: player,
                queue: [],
                history: [],
                current: null,
                loop: 0, 
                volume: 1, 
                textChannel: message.channel,
                resource: null
            };
            musicQueues.set(guildId, contract);

            player.on(AudioPlayerStatus.Idle, () => this.playNext(guildId));
            player.on('error', e => {
                console.error('Audio Player Error:', e);
                this.playNext(guildId);
            });
        }

        const q = musicQueues.get(guildId);

        if (!q.connection || q.connection.state.status === VoiceConnectionStatus.Destroyed) {
            try {
                q.connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: message.guild.id,
                    adapterCreator: message.guild.voiceAdapterCreator,
                });
                q.connection.subscribe(q.player);
            } catch (err) {
                musicQueues.delete(guildId);
                return message.reply("❌ Error connecting to voice channel.");
            }
        }

        try {
            const r = await ytSearch(query);
            const videos = r.videos.slice(0, 5);

            if (!videos.length) return message.reply("❌ No results found on YouTube.");

            if (videos.length === 1) {
                this.addToQueue(q, this.formatVideo(videos[0], message.author), message);
                return;
            }

            const options = videos.map((v, i) => 
                new StringSelectMenuOptionBuilder()
                    .setLabel(`${i + 1}. ${v.title.substring(0, 95)}`)
                    .setDescription(`Duration: ${v.timestamp}`)
                    .setValue(v.videoId)
                    .setEmoji('🎵')
            );

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('song_select').setPlaceholder('Choose a song...').addOptions(options)
            );

            const msg = await message.reply({ content: `🔎 **Searching YouTube for:** \`${query}\``, components: [row] });

            const collector = msg.createMessageComponentCollector({ 
                componentType: ComponentType.StringSelect, 
                time: 30000,
                filter: i => i.user.id === message.author.id 
            });

            collector.on('collect', async i => {
                await i.deferUpdate();
                const video = videos.find(v => v.videoId === i.values[0]);
                this.addToQueue(q, this.formatVideo(video, message.author), message);
                await msg.edit({ content: `✅ Queued: **${video.title}**`, components: [] });
                collector.stop();
            });

            collector.on('end', (c, r) => { if (r === 'time') msg.edit({ content: "❌ Search expired.", components: [] }).catch(()=>{}); });

        } catch (e) {
            console.error("Search Logic Error:", e);
            message.reply("❌ An error occurred while searching.");
        }
    },

    formatVideo(v, user) {
        return { title: v.title, url: v.url, duration: v.timestamp, sec: v.seconds, thumb: v.thumbnail, req: user, seek: 0 };
    },

    addToQueue(q, song, message) {
        q.queue.push(song);
        if (!q.current) this.playNext(message.guild.id);
        else {
            const embed = new EmbedBuilder()
                .setTitle("🎵 Added to Queue")
                .setDescription(`[${song.title}](${song.url})`)
                .setThumbnail(song.thumb)
                .setFooter({ text: `Queue Position: ${q.queue.length}` })
                .setColor(0x5865F2);
            q.textChannel.send({ embeds: [embed] });
        }
    },

    async playNext(guildId, forceSong = null) {
        const q = musicQueues.get(guildId);
        if (!q) return;

        if (q.current && !forceSong) {
            if (q.loop === 1) q.queue.unshift(q.current);
            else if (q.loop === 2) q.queue.push(q.current);
            else {
                q.history.push(q.current);
                if (q.history.length > 20) q.history.shift();
            }
        }

        const song = forceSong || q.queue.shift();
        
        if (!song) {
            q.current = null;
            setTimeout(() => {
                if (q.connection && !q.current) {
                    try { q.connection.destroy(); } catch(e){}
                    musicQueues.delete(guildId);
                }
            }, 60000);
            return q.textChannel.send("⏹️ Queue finished. I'll leave in 1 minute if nothing else is played.");
        }

        q.current = song;

        try {
            // Using play-dl with your cookies to bypass the 403 Forbidden block
            const stream = await play.stream(song.url, { 
                seek: song.seek || 0,
                quality: 2,
                discordPlayerCompatibility: true
            });

            const resource = createAudioResource(stream.stream, { 
                inputType: stream.type, 
                inlineVolume: true 
            });
            
            resource.volume.setVolume(q.volume);
            q.player.play(resource);
            q.resource = resource; 

            if (song.seek === 0 && q.loop !== 1) {
                const embed = new EmbedBuilder()
                    .setTitle("▶️ Now Playing")
                    .setDescription(`[${song.title}](${song.url})`)
                    .setThumbnail(song.thumb)
                    .addFields(
                        { name: 'Duration', value: song.duration, inline: true },
                        { name: 'Requested By', value: song.req.username, inline: true }
                    )
                    .setColor(0x2ECC71);
                q.textChannel.send({ embeds: [embed] });
            }
        } catch (e) {
            console.error("Stream Error (403/Forbidden):", e);
            q.textChannel.send(`❌ YouTube blocked the stream for **${song.title}**. This usually happens if cookies expire. Skipping...`);
            this.playNext(guildId);
        }
    },

    // --- CONTROLS ---
    skip(msg) { const q = musicQueues.get(msg.guild.id); if (q && q.current) { q.player.stop(); msg.reply("⏩ Song skipped."); } },
    stop(msg) { const q = musicQueues.get(msg.guild.id); if (q) { q.player.stop(); if (q.connection) try { q.connection.destroy(); } catch(e){} musicQueues.delete(msg.guild.id); msg.reply("🛑 Stopped and cleared the queue."); } },
    pause(msg) { const q = musicQueues.get(msg.guild.id); if (q) { q.player.pause(); msg.reply("⏸️ Music paused."); } },
    resume(msg) { const q = musicQueues.get(msg.guild.id); if (q) { q.player.unpause(); msg.reply("▶️ Music resumed."); } },
    setVolume(msg, vol) { const q = musicQueues.get(msg.guild.id); if (q && q.resource) { q.volume = Math.max(0, Math.min(200, parseInt(vol)))/100; q.resource.volume.setVolume(q.volume); msg.reply(`🔊 Volume: ${vol}%`); } },
    setLoop(msg, m) { const q = musicQueues.get(msg.guild.id); if (q) { q.loop = m==='off'?0:m==='song'?1:2; msg.reply(`🔁 Loop mode set to: **${m}**`); } },
    shuffle(msg) { const q = musicQueues.get(msg.guild.id); if(q) { q.queue.sort(() => Math.random() - 0.5); msg.reply("🔀 Queue shuffled."); } },
    getQueue(msg) { 
        const q = musicQueues.get(msg.guild.id); 
        if(!q || !q.queue.length) return msg.reply("The queue is empty."); 
        const list = q.queue.slice(0, 10).map((s,i) => `**${i+1}.** ${s.title}`).join('\n');
        msg.reply({ embeds: [new EmbedBuilder().setTitle("Current Queue").setDescription(list).setColor(0x5865F2)] });
    },
    nowPlaying(msg) { const q = musicQueues.get(msg.guild.id); if(q && q.current) msg.reply(`▶️ Playing: **${q.current.title}**`); },
    back(msg) { const q = musicQueues.get(msg.guild.id); if(q && q.history.length) { q.queue.unshift(q.current); this.playNext(msg.guild.id, q.history.pop()); msg.reply("⏮️ Back to previous song."); } },
    seek(msg, sec) { const q = musicQueues.get(msg.guild.id); if(q && q.current) { q.current.seek = parseInt(sec); this.playNext(msg.guild.id, q.current); msg.reply(`⏩ Jumped to ${sec} seconds.`); } }
};