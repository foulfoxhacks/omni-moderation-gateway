/**
 * OMNI-BOT FINAL: The Complete Integrated System
 */

require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits, Collection, Partials, REST, Routes } = require('discord.js');
const TelegramBot = require('node-telegram-bot-api');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

// --- LIBRARIES ---
const si = require('systeminformation');
const speedTest = require('speedtest-net');
const os = require('os');
const axios = require('axios'); 
const weather = require('weather-js');

// --- SYSTEM MODULES ---
const Health = require('./systems/health');
const Bridge = require('./systems/bridge');
const Captcha = require('./systems/captcha');
const Features = require('./systems/features'); 
const Logger = require('./systems/logger');
const Invites = require('./systems/invites');
const Leaver = require('./systems/leaver');
const Streamers = require('./systems/streamers');

// --- SETUP CLIENTS ---
const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildInvites
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User],
});

discordClient.commands = new Collection();

// Telegram Setup
const telegramClient = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// --- COMMAND LOADER ---
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        discordClient.commands.set(command.name, command);
        console.log(`Loaded Command: ${command.name}`);
    }
}

// ====================================================
// DISCORD EVENTS
// ====================================================

discordClient.on('ready', async () => {
    console.log(`✅ Discord Online: ${discordClient.user.tag}`);
    Health.sendWebhook("🟢 System Online", "Bot started. Streamer & Badge systems active.", 0x2ECC71);
    
    // Initialize Systems
    Invites.cacheInvites(discordClient);

    // Start Standard Loops
    setInterval(() => Features.checkRSSLoop(discordClient), 300000);        // RSS (5m)
    setInterval(() => Features.updateStatsLoop(discordClient), 600000);     // Stats (10m)
    setInterval(() => Features.checkRemindersLoop(discordClient), 60000);   // Reminders (1m)

    // --- STREAMER NOTIFICATION LOOP (ADDED) ---
    setInterval(() => {
        Streamers.checkTwitch(discordClient);
        Streamers.checkYouTube(discordClient);
        Streamers.checkKick(discordClient);
    }, 120000); // Check every 2 minutes

    // Register Slash Command
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(
            Routes.applicationCommands(discordClient.user.id),
            { body: [{ name: 'active', description: 'Run this to qualify for the Active Developer Badge' }] },
        );
    } catch (e) { console.error("Slash Reg Error:", e); }
});

// Handlers
const messageHandler = require('./events/discord/messageCreate');
discordClient.on('messageCreate', (msg) => messageHandler(discordClient, telegramClient, msg, discordClient.commands));

const interactionHandler = require('./events/discord/interactionCreate');
discordClient.on('interactionCreate', (i) => interactionHandler(discordClient, i));

const memberAddHandler = require('./events/discord/guildMemberAdd');
discordClient.on('guildMemberAdd', (m) => memberAddHandler(discordClient, m));

// Leaver & Invites
discordClient.on('guildMemberRemove', (m) => {
    Invites.trackLeave(m);
    Leaver.handleLeave(m);
});

discordClient.on('inviteCreate', (inv) => Invites.updateCache(inv.guild));
discordClient.on('inviteDelete', (inv) => Invites.updateCache(inv.guild));

const voiceHandler = require('./events/discord/voiceStateUpdate');
discordClient.on('voiceStateUpdate', (o, n) => voiceHandler(discordClient, o, n));

const reactionHandler = require('./events/discord/messageReactionAdd');
discordClient.on('messageReactionAdd', (r, u) => reactionHandler(discordClient, r, u));

// Logging
discordClient.on('messageDelete', (m) => Logger.onMessageDelete(m));
discordClient.on('messageUpdate', (o, n) => Logger.onMessageUpdate(o, n));
discordClient.on('channelCreate', (c) => Logger.onChannelCreate(c));
discordClient.on('channelDelete', (c) => Logger.onChannelDelete(c));
discordClient.on('roleCreate', (r) => Logger.onRoleCreate(r));
discordClient.on('roleDelete', (r) => Logger.onRoleDelete(r));
discordClient.on('guildMemberUpdate', (o, n) => Logger.onGuildMemberUpdate(o, n));

// ====================================================
// TELEGRAM EVENTS
// ====================================================
telegramClient.on('message', async (msg) => {
    // 1. Join Event -> Trigger Captcha
    if (msg.new_chat_members) return Captcha.handleTgJoin(telegramClient, msg);

    // 2. Bridge -> Send Text/Media to Discord
    // Uses the updated bridge.js logic (Webhooks) automatically
    Bridge.sendToDc(discordClient, msg, telegramClient);

    // 3. Command Handler
    if (!msg.text) return;
    const text = msg.text;
    if (!text.startsWith('/') && !text.startsWith('!')) return;

    const args = text.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Helper: Find Linked Guild
    const getLinkedGuild = async () => {
        const channelId = await db.get(`bridge_t2d_${msg.chat.id}`);
        if (!channelId) return null;
        const channel = await discordClient.channels.fetch(channelId).catch(() => null);
        return channel ? channel.guild : null;
    };

    try {
        if (command === 'ping') telegramClient.sendMessage(msg.chat.id, "🏓 **Pong!**", { parse_mode: 'Markdown' });
        if (command === 'id') telegramClient.sendMessage(msg.chat.id, `🆔 \`${msg.chat.id}\``, { parse_mode: 'Markdown' });
        
        if (command === '8ball') {
            const answers = ["Yes.", "No.", "Maybe.", "Ask again later.", "Definitely.", "I doubt it."];
            const result = answers[Math.floor(Math.random() * answers.length)];
            telegramClient.sendMessage(msg.chat.id, `🎱 **${result}**`, { parse_mode: 'Markdown' });
        }

        // --- OWNER INFO (New) ---
        if (command === 'botinfo' || command === 'owner') {
            const text = "🦊 **Bot Owner: Sammy (FoulFoxHacks)**\n\n" +
                         "I’m Sammy — also known as FoulFoxHacks — a hobbyist creator and Furry Pup wandering the interwebs,🐾 always learning, building, and doing my part to make the world a little brighter ☯️";
            
            const opts = {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🔗 Visit GitHub", url: "https://github.com/foulfoxhacks" }]
                    ]
                }
            };
            telegramClient.sendMessage(msg.chat.id, text, opts);
        }

        // --- FULL CALLSIGN LOOKUP ---
        if (command === 'callsign') {
            const callsign = args[0];
            if (!callsign) return telegramClient.sendMessage(msg.chat.id, "Usage: `!callsign <code`");
            try {
                const res = await axios.get(`https://callook.info/${callsign}/json`);
                if (res.data.status === 'INVALID') return telegramClient.sendMessage(msg.chat.id, "❌ Invalid.");
                
                const d = res.data;
                const output = `📻 **Callsign: ${d.current.callsign}**\n` +
                               `👤 **Name:** ${d.name}\n` +
                               `🎓 **Class:** ${d.current.operClass}\n` +
                               `📍 **Addr:** ${d.address.line1}, ${d.address.line2}\n` +
                               `🗺️ **Grid:** ${d.other.gridsquare}\n` +
                               `📅 **Exp:** ${d.other.expiryDate}`;
                
                telegramClient.sendMessage(msg.chat.id, output, { parse_mode: 'Markdown' });
            } catch (e) { telegramClient.sendMessage(msg.chat.id, "❌ Error."); }
        }

        // --- FULL WEATHER LOOKUP ---
        if (command === 'weather') {
            const query = args.join(" ");
            if (!query) return telegramClient.sendMessage(msg.chat.id, "Usage: `!weather <city>`");
            weather.find({ search: query, degreeType: 'F' }, function(err, result) {
                if (err || !result || result.length === 0) return telegramClient.sendMessage(msg.chat.id, "❌ Not found.");
                const cur = result[0].current;
                const loc = result[0].location;
                
                const output = `🌦️ **Weather for ${loc.name}**\n` +
                               `🌡️ **Temp:** ${cur.temperature}°F (Feels ${cur.feelslike}°F)\n` +
                               `☁️ **Sky:** ${cur.skytext}\n` +
                               `💧 **Hum:** ${cur.humidity}%\n` +
                               `💨 **Wind:** ${cur.winddisplay}\n` +
                               `📍 **Coords:** ${loc.lat}, ${loc.long}`;
                               
                telegramClient.sendMessage(msg.chat.id, output, { parse_mode: 'Markdown' });
            });
        }

        // --- FULL SPEEDTEST ---
        if (command === 'speedtest') {
            const sent = await telegramClient.sendMessage(msg.chat.id, "🚀 Running network diagnostics (Wait 15s)...");
            try {
                const res = await speedTest({ acceptLicense: true, acceptGdpr: true });
                const dl = (res.download.bandwidth / 125000).toFixed(2);
                const ul = (res.upload.bandwidth / 125000).toFixed(2);
                const ping = res.ping.latency.toFixed(0);
                const jitter = res.ping.jitter.toFixed(0);
                
                telegramClient.editMessageText(
                    `📶 **Network Results**\n` +
                    `📥 **Download:** ${dl} Mbps\n` +
                    `📤 **Upload:** ${ul} Mbps\n` +
                    `⏱️ **Ping:** ${ping} ms\n` +
                    `📉 **Jitter:** ${jitter} ms\n` +
                    `🏢 **ISP:** ${res.isp}\n` +
                    `📍 **Server:** ${res.server.location} (${res.server.country})`,
                    { chat_id: msg.chat.id, message_id: sent.message_id, parse_mode: 'Markdown' }
                );
            } catch (err) {
                telegramClient.editMessageText("❌ Speedtest Failed. Network busy.", { chat_id: msg.chat.id, message_id: sent.message_id });
            }
        }

        // --- EXTENDED DEBUG STATS ---
        if (command === 'debug') {
            const cpu = await si.cpu();
            const mem = await si.mem();
            const osInfo = await si.osInfo();
            const heap = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
            telegramClient.sendMessage(msg.chat.id,
                `🛠️ **Debug Stats**\n` +
                `**CPU:** ${cpu.manufacturer} ${cpu.brand} (${cpu.speed}GHz)\n` +
                `**Cores:** ${cpu.cores}\n` +
                `**Memory:** Total ${(mem.total/1e9).toFixed(2)}GB | Free ${(mem.free/1e9).toFixed(2)}GB\n` +
                `**Heap:** ${heap}MB\n` +
                `**OS:** ${osInfo.platform} ${osInfo.release}\n` +
                `**Node:** ${process.version}`,
                { parse_mode: 'Markdown' }
            );
        }

        if (command === 'health') {
            const s = await Health.getStats();
            telegramClient.sendMessage(msg.chat.id, 
                `🖥️ **System Health**\n` +
                `**CPU:** ${s.cpu}\n**RAM:** ${s.ram}\n**Uptime:** ${s.uptime}\n**OS:** ${s.os}`, 
                { parse_mode: 'Markdown' }
            );
        }

        if (command === 'serverinfo' || command === 'stat' || command === 'stats') {
            const guild = await getLinkedGuild();
            if (guild) {
                const owner = await guild.fetchOwner();
                telegramClient.sendMessage(msg.chat.id, 
                    `📊 **${guild.name}**\n` +
                    `**Members:** ${guild.memberCount}\n` +
                    `**Owner:** ${owner.user.tag}\n` +
                    `**Channels:** ${guild.channels.cache.size}\n` +
                    `**Created:** ${guild.createdAt.toDateString()}`,
                    { parse_mode: 'Markdown' }
                );
            } else {
                telegramClient.sendMessage(msg.chat.id, "Not bridged.");
            }
        }

        // --- FULL HELP MENU ---
        if (command === 'help') {
            telegramClient.sendMessage(msg.chat.id, 
                "🤖 **Omni-Bot Telegram Commands**\n" +
                "`!ping`      - Check latency\n" +
                "`!id`        - Get Chat ID\n" +
                "`!botinfo`   - Owner Info\n" +
                "`!weather`   - Check weather\n" +
                "`!callsign`  - Radio Lookup\n" +
                "`!speedtest` - Network Quality\n" +
                "`!serverinfo`- Discord Stats\n" +
                "`!health`    - Host Health\n" +
                "`!debug`     - Advanced Stats\n" +
                "`!8ball`     - Magic 8-Ball\n" +
                "\n*Admin commands must be run from Discord.*",
                { parse_mode: 'Markdown' }
            );
        }

    } catch (e) {
        console.error("TG Cmd Error:", e.message);
    }
});

// Captcha Callback
telegramClient.on('callback_query', async (q) => {
    // Handle GitHub Link Button (Do nothing, client handles URL)
    if (q.data === 'ignore') return;

    if (!q.data.startsWith('vc_')) return;
    const [_, targetId, res] = q.data.split('_');
    if (q.from.id.toString() !== targetId) return telegramClient.answerCallbackQuery(q.id, { text: "Not yours!", show_alert: true });
    
    if (res === 'ok') {
        await telegramClient.restrictChatMember(q.message.chat.id, targetId, {
            can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true
        }).catch(()=>{});
        telegramClient.deleteMessage(q.message.chat.id, q.message.message_id);
        telegramClient.answerCallbackQuery(q.id, { text: "Verified!" });
    } else {
        telegramClient.answerCallbackQuery(q.id, { text: "Wrong.", show_alert: true });
    }
});

// Errors
process.on('uncaughtException', (e) => Health.sendWebhook("🚨 Uncaught", `\`\`\`${e.stack}\`\`\``, 0xE74C3C));
process.on('unhandledRejection', (e) => Health.sendWebhook("🚨 Rejection", `\`\`\`${e.stack || e}\`\`\``, 0xE74C3C));

discordClient.login(process.env.DISCORD_TOKEN);