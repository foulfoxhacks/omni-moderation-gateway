const Bridge = require('../../systems/bridge');
const Features = require('../../systems/features'); // XP & Stats
const { QuickDB } = require('quick.db');
const db = new QuickDB();
require('dotenv').config();

// AutoMod Configuration
const BAD_WORDS = ["scam", "free nitro", "steam drop", "discord.gg/"];

module.exports = async (client, tgClient, message, commands) => {
    // ====================================================
    // 1. AUTO-MODERATION (Block bad words first)
    // ====================================================
    if (BAD_WORDS.some(word => message.content.toLowerCase().includes(word))) {
        // Exempt Admins
        if (!message.member || !message.member.permissions.has("Administrator")) {
            if (message.author.bot) return; // Don't auto-mod bots, just ignore
            await message.delete().catch(() => {});
            const warning = await message.channel.send(`⚠️ ${message.author}, that content is blocked.`);
            setTimeout(() => warning.delete().catch(() => {}), 5000);
            return; // Stop processing
        }
    }

    // ====================================================
    // 2. RUN BRIDGE (Sync to Telegram)
    // ====================================================
    // We run this BEFORE checking if it's a bot.
    // The Bridge system inside `systems/bridge.js` has its own check
    // to ensure it only bridges Users + The Omni-Bot itself.
    Bridge.sendToTg(tgClient, message);

    // ====================================================
    // 3. BOT CHECK
    // ====================================================
    // Now we stop other bots from triggering Commands or XP
    if (message.author.bot) return;

    // ====================================================
    // 4. AFK SYSTEM
    // ====================================================
    // A) Is Author AFK? (Remove status)
    const isAfk = await db.get(`afk_${message.guild.id}_${message.author.id}`);
    if (isAfk) {
        await db.delete(`afk_${message.guild.id}_${message.author.id}`);
        message.reply("👋 Welcome back! AFK removed.").then(m => setTimeout(() => m.delete(), 5000));
    }

    // B) Is Mentioned User AFK? (Notify author)
    const mentioned = message.mentions.users.first();
    if (mentioned) {
        const mentionedAfk = await db.get(`afk_${message.guild.id}_${mentioned.id}`);
        if (mentionedAfk) {
            message.reply(`💤 **${mentioned.username}** is AFK: ${mentionedAfk}`);
        }
    }

    // ====================================================
    // 5. CUSTOM COMMANDS
    // ====================================================
    const customCmds = await db.get(`cc_${message.guild.id}`) || [];
    const foundCC = customCmds.find(cc => message.content.toLowerCase() === cc.trigger);
    if (foundCC) {
        return message.channel.send(foundCC.response);
    }

    // ====================================================
    // 6. PASSIVE XP
    // ====================================================
    Features.addXp(message);

    // ====================================================
    // 7. COMMAND HANDLER
    // ====================================================
    const prefix = process.env.PREFIX || '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();

    const command = commands.get(cmdName);
    if (command) {
        try {
            await command.execute(message, args, client, tgClient);
        } catch (error) {
            console.error(`Error in ${cmdName}:`, error);
            message.reply('❌ Command failed to execute.');
        }
    }
};