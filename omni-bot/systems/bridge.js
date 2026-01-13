const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    // ====================================================
    // DISCORD -> TELEGRAM (Sending Side)
    // ====================================================
    async sendToTg(tgClient, msg) {
        if (msg.author.bot && msg.author.id !== msg.client.user.id) return;
        if (msg.webhookId) return; 

        const chatId = await db.get(`bridge_d2t_${msg.channel.id}`);
        if (!chatId) return;

        let content = "";
        const authorName = msg.member ? msg.member.displayName : msg.author.username;

        if (!msg.author.bot) {
            content = `<b>${authorName}:</b> ${msg.content || ""}`;
        } else {
            if (msg.embeds.length > 0) {
                const embed = msg.embeds[0];
                content += `🤖 <b>${embed.title || "Bot Notification"}</b>\n`;
                if (embed.description) content += `${embed.description}\n`;
                if (embed.fields) embed.fields.forEach(f => content += `\n<b>${f.name}:</b> ${f.value}`);
                if (embed.footer) content += `\n<i>${embed.footer.text}</i>`;
            } else {
                content = `🤖 <b>System:</b> ${msg.content}`;
            }
        }

        let sentMedia = false;
        if (msg.attachments.size > 0) {
            for (const [id, attachment] of msg.attachments) {
                try {
                    const url = attachment.url;
                    const opts = { caption: content.substring(0, 1024), parse_mode: 'HTML' };
                    
                    if (attachment.contentType?.startsWith('image')) await tgClient.sendPhoto(chatId, url, opts);
                    else if (attachment.contentType?.startsWith('video')) await tgClient.sendVideo(chatId, url, opts);
                    else if (attachment.contentType?.startsWith('audio')) await tgClient.sendAudio(chatId, url, opts);
                    else await tgClient.sendDocument(chatId, url, opts);
                    
                    content = ""; 
                    sentMedia = true;
                } catch (e) {
                    if (!sentMedia) await tgClient.sendMessage(chatId, `${content}\n[📎 File]`, { parse_mode: 'HTML' });
                    sentMedia = true;
                }
            }
        } else if (msg.embeds.length > 0 && msg.embeds[0].image) {
            try {
                await tgClient.sendPhoto(chatId, msg.embeds[0].image.url, { caption: content.substring(0, 1024), parse_mode: 'HTML' });
                sentMedia = true;
            } catch (e) {}
        }

        if (!sentMedia && content.replace(/<[^>]*>/g, '').trim().length > 0) {
            try {
                await tgClient.sendMessage(chatId, content, { parse_mode: 'HTML' });
            } catch (e) {
                await tgClient.sendMessage(chatId, content.replace(/<[^>]*>?/gm, ''));
            }
        }
    },

    // ====================================================
    // TELEGRAM -> DISCORD (Receiving Side)
    // ====================================================
    async sendToDc(dcClient, tgMsg, tgClient) {
        const channelId = await db.get(`bridge_t2d_${tgMsg.chat.id}`);
        if (!channelId) return;
        const channel = await dcClient.channels.fetch(channelId).catch(() => null);
        if (!channel) return;

        const senderName = (tgMsg.from.first_name + (tgMsg.from.last_name ? ` ${tgMsg.from.last_name}` : '')).substring(0, 75) + " [TG]";
        
        // 1. Avatar Fix (REQUIRED for Webhooks)
        let senderAvatar = 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg';
        try {
            const photos = await tgClient.getUserProfilePhotos(tgMsg.from.id, { limit: 1 });
            if (photos && photos.total_count > 0) {
                const photoArray = photos.photos[0];
                const fileId = photoArray[photoArray.length - 1].file_id;
                const link = await tgClient.getFileLink(fileId);
                senderAvatar = `${link}?v=1.png`; 
            }
        } catch (e) {}

        let content = tgMsg.text || tgMsg.caption || "";
        const files = [];

        // 2. Media Extraction
        try {
            let fileId = null;
            if (tgMsg.photo) {
                fileId = tgMsg.photo[tgMsg.photo.length - 1].file_id;
            } 
            else if (tgMsg.sticker) { 
                if (tgMsg.sticker.is_video) {
                    const videoLink = await tgClient.getFileLink(tgMsg.sticker.file_id);
                    files.push({ attachment: videoLink, name: "sticker.webm" }); 
                } else if (tgMsg.sticker.is_animated) {
                    fileId = tgMsg.sticker.thumbnail ? tgMsg.sticker.thumbnail.file_id : tgMsg.sticker.file_id;
                    content += " [Animated Sticker]";
                } else {
                    fileId = tgMsg.sticker.file_id; 
                }
            }
            else if (tgMsg.voice) { fileId = tgMsg.voice.file_id; content += " 🎤 [Voice]"; }
            else if (tgMsg.video_note) { fileId = tgMsg.video_note.file_id; content += " ⏺️ [Video Note]"; }
            else if (tgMsg.audio) { fileId = tgMsg.audio.file_id; content += " 🎵 [Audio]"; }
            else if (tgMsg.video) fileId = tgMsg.video.file_id;
            else if (tgMsg.document) { fileId = tgMsg.document.file_id; content += " 📄 [File]"; }

            if (fileId && files.length === 0) {
                const fileLink = await tgClient.getFileLink(fileId);
                files.push(fileLink);
            }
        } catch (e) { console.error("Media Error:", e.message); }

        // 3. Webhook Delivery
        try {
            const webhooks = await channel.fetchWebhooks();
            let webhook = webhooks.find(w => w.name === 'Omni-Bridge');
            if (!webhook) {
                webhook = await channel.createWebhook({
                    name: 'Omni-Bridge',
                    avatar: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg'
                });
            }

            if (content || files.length > 0) {
                await webhook.send({
                    content: content || null,
                    username: senderName,
                    avatarURL: senderAvatar,
                    files: files
                });
            }
        } catch (error) {
            // 4. Fallback (Duplication Cleanup)
            const embed = new EmbedBuilder()
                .setAuthor({ name: senderName, iconURL: senderAvatar })
                .setDescription(content || "[Media]")
                .setColor(0x0088cc)
                .setTimestamp();
            
            const payload = { embeds: [embed] };

            if (files.length > 0) {
                // If it's an image/static sticker, put it in the embed and DON'T attach separately
                if (tgMsg.photo || (tgMsg.sticker && !tgMsg.sticker.is_video)) {
                    const imgSource = files[0].attachment || files[0];
                    embed.setImage(imgSource);
                } else {
                    // If it's a video, audio, or document, attach it as a file
                    payload.files = files;
                }
            }

            if (content || files.length > 0) await channel.send(payload);
        }
    }
};