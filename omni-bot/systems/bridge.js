const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    // ====================================================
    // DISCORD -> TELEGRAM (Sending Side)
    // ====================================================
    async sendToTg(tgClient, msg) {
        // 1. SAFETY FILTER:
        // - Ignore other bots (prevent spam loops)
        // - ALLOW this bot (so !help or !speedtest replies sync to Telegram)
        // - IGNORE Webhooks (Crucial: prevents looping back what came from Telegram)
        if (msg.author.bot && msg.author.id !== msg.client.user.id) return;
        if (msg.webhookId) return; 

        // 2. CHECK DATABASE LINK
        const chatId = await db.get(`bridge_d2t_${msg.channel.id}`);
        if (!chatId) return;

        // 3. FORMAT CONTENT
        let content = "";
        const authorName = msg.member ? msg.member.displayName : msg.author.username;

        // Case A: User Message (Clean Text)
        if (!msg.author.bot) {
            content = `<b>${authorName}:</b> ${msg.content || ""}`;
        } 
        // Case B: Bot Message (Convert Embeds to Readable HTML)
        else {
            if (msg.embeds.length > 0) {
                const embed = msg.embeds[0];
                content += `🤖 <b>${embed.title || "Bot Notification"}</b>\n`;
                if (embed.description) content += `${embed.description}\n`;
                
                // Add Fields (Stats, Info, etc)
                if (embed.fields && embed.fields.length > 0) {
                    embed.fields.forEach(f => {
                        content += `\n<b>${f.name}:</b> ${f.value}`;
                    });
                }
                
                // Add Footer
                if (embed.footer) content += `\n<i>${embed.footer.text}</i>`;
            } else {
                content = `🤖 <b>System:</b> ${msg.content}`;
            }
        }

        // 4. SEND TO TELEGRAM
        let sentImage = false;

        // Handle Attachments (Images/Videos from Users)
        if (msg.attachments.size > 0) {
            for (const [id, attachment] of msg.attachments) {
                try {
                    const url = attachment.url;
                    // Send based on type
                    if (attachment.contentType?.startsWith('image')) await tgClient.sendPhoto(chatId, url, { caption: content.substring(0, 1024), parse_mode: 'HTML' });
                    else if (attachment.contentType?.startsWith('video')) await tgClient.sendVideo(chatId, url, { caption: content.substring(0, 1024), parse_mode: 'HTML' });
                    else if (attachment.contentType?.startsWith('audio')) await tgClient.sendAudio(chatId, url, { caption: content.substring(0, 1024), parse_mode: 'HTML' });
                    else await tgClient.sendDocument(chatId, url, { caption: content.substring(0, 1024), parse_mode: 'HTML' });
                    
                    content = ""; // Clear text after first attachment
                    sentImage = true;
                } catch (e) {
                    // Fallback for large files
                    if (!sentImage) await tgClient.sendMessage(chatId, `${content}\n[📎 File: ${url}]`, { parse_mode: 'HTML' });
                    sentImage = true;
                }
            }
        } 
        // Handle Embed Images (e.g. Welcome Cards)
        else if (msg.embeds.length > 0 && msg.embeds[0].image) {
            try {
                await tgClient.sendPhoto(chatId, msg.embeds[0].image.url, { caption: content.substring(0, 1024), parse_mode: 'HTML' });
                sentImage = true;
            } catch (e) {}
        }

        // Send Text (if no image was sent, or if text remains)
        if (!sentImage && content.replace(/<[^>]*>/g, '').trim().length > 0) {
            try {
                await tgClient.sendMessage(chatId, content, { parse_mode: 'HTML' });
            } catch (e) {
                // Strip HTML tags if Telegram rejects bad formatting
                await tgClient.sendMessage(chatId, content.replace(/<[^>]*>?/gm, ''));
            }
        }
    },

    // ====================================================
    // TELEGRAM -> DISCORD (Receiving Side - Uses Webhooks)
    // ====================================================
    async sendToDc(dcClient, tgMsg, tgClient) {
        const channelId = await db.get(`bridge_t2d_${tgMsg.chat.id}`);
        if (!channelId) return;

        const channel = await dcClient.channels.fetch(channelId).catch(() => null);
        if (!channel) return;

        // 1. Prepare Content
        const senderName = (tgMsg.from.first_name + (tgMsg.from.last_name ? ` ${tgMsg.from.last_name}` : '')).substring(0, 75) + " [TG]";
        
        // 1a. Fetch Real Avatar (Version B Feature)
        let senderAvatar = 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg';
        try {
            const photos = await tgClient.getUserProfilePhotos(tgMsg.from.id, { limit: 1 });
            if (photos && photos.total_count > 0) {
                const fileId = photos.photos[0][0].file_id;
                senderAvatar = await tgClient.getFileLink(fileId);
            }
        } catch (e) {}

        let content = tgMsg.text || tgMsg.caption || "";
        const files = [];

        // 2. Extract Media
        try {
            let fileId = null;
            if (tgMsg.photo) fileId = tgMsg.photo[tgMsg.photo.length - 1].file_id;
            else if (tgMsg.sticker) { 
                // 2a. Animated Sticker Logic (Version B Feature)
                if (tgMsg.sticker.is_animated || tgMsg.sticker.is_video) {
                    if (tgMsg.sticker.thumbnail) fileId = tgMsg.sticker.thumbnail.file_id;
                    else content += " [Animated Sticker]";
                } else {
                    fileId = tgMsg.sticker.file_id; 
                }
            }
            else if (tgMsg.voice) { fileId = tgMsg.voice.file_id; content += " 🎤 [Voice]"; }
            else if (tgMsg.video) fileId = tgMsg.video.file_id;
            else if (tgMsg.video_note) { fileId = tgMsg.video_note.file_id; content += " ⏺️ [Video Note]"; }
            else if (tgMsg.document) { fileId = tgMsg.document.file_id; content += " 📄 [File]"; }

            if (fileId) {
                const fileLink = await tgClient.getFileLink(fileId);
                files.push(fileLink);
            }
        } catch (e) { console.error("Media Error:", e.message); }

        // 3. SEND VIA WEBHOOK (Clean Look)
        try {
            // A. Get or Create Webhook
            const webhooks = await channel.fetchWebhooks();
            let webhook = webhooks.find(w => w.name === 'Omni-Bridge');
            
            if (!webhook) {
                webhook = await channel.createWebhook({
                    name: 'Omni-Bridge',
                    avatar: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg'
                });
            }

            // B. Send Message
            if (content || files.length > 0) {
                await webhook.send({
                    content: content,
                    username: senderName,
                    avatarURL: senderAvatar,
                    files: files
                });
            }

        } catch (error) {
            // 4. FALLBACK (If permissions missing, use Embed)
            const embed = new EmbedBuilder()
                .setAuthor({ name: senderName, iconURL: senderAvatar })
                .setDescription(content || "[Media]")
                .setColor(0x0088cc)
                .setTimestamp();
            
            // If photo/sticker, show inside embed
            if (files.length > 0 && (tgMsg.photo || tgMsg.sticker)) embed.setImage(files[0]);
            
            const payload = { embeds: [embed] };
            // If other file, attach it
            if (files.length > 0 && !tgMsg.photo && !tgMsg.sticker) payload.files = files;

            if (content || files.length > 0) await channel.send(payload);
        }
    }
};