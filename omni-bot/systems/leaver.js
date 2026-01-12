const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    // DISCORD -> TELEGRAM (Unchanged)
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
            } else {
                content = `🤖 <b>System:</b> ${msg.content}`;
            }
        }

        let sentImage = false;
        if (msg.attachments.size > 0) {
            for (const [id, attachment] of msg.attachments) {
                try {
                    const url = attachment.url;
                    if (attachment.contentType?.startsWith('image')) await tgClient.sendPhoto(chatId, url, { caption: content.substring(0, 1024), parse_mode: 'HTML' });
                    else if (attachment.contentType?.startsWith('video')) await tgClient.sendVideo(chatId, url, { caption: content.substring(0, 1024), parse_mode: 'HTML' });
                    else if (attachment.contentType?.startsWith('audio')) await tgClient.sendAudio(chatId, url, { caption: content.substring(0, 1024), parse_mode: 'HTML' });
                    else await tgClient.sendDocument(chatId, url, { caption: content.substring(0, 1024), parse_mode: 'HTML' });
                    content = ""; 
                    sentImage = true;
                } catch (e) {}
            }
        } else if (msg.embeds.length > 0 && msg.embeds[0].image) {
            try {
                await tgClient.sendPhoto(chatId, msg.embeds[0].image.url, { caption: content.substring(0, 1024), parse_mode: 'HTML' });
                sentImage = true;
            } catch (e) {}
        }

        if (!sentImage && content.replace(/<[^>]*>/g, '').trim().length > 0) {
            try { await tgClient.sendMessage(chatId, content, { parse_mode: 'HTML' }); } 
            catch (e) { await tgClient.sendMessage(chatId, content.replace(/<[^>]*>?/gm, '')); }
        }
    },

    // TELEGRAM -> DISCORD (Updated Logic)
    async sendToDc(dcClient, tgMsg, tgClient) {
        const channelId = await db.get(`bridge_t2d_${tgMsg.chat.id}`);
        if (!channelId) return;

        const channel = await dcClient.channels.fetch(channelId).catch(() => null);
        if (!channel) return;

        // 1. Fetch Real Telegram Avatar
        let senderAvatar = 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg';
        try {
            const photos = await tgClient.getUserProfilePhotos(tgMsg.from.id, { limit: 1 });
            if (photos && photos.total_count > 0) {
                const fileId = photos.photos[0][0].file_id; // Get smallest size for icon
                senderAvatar = await tgClient.getFileLink(fileId);
            }
        } catch (e) { /* Ignore fetch errors, keep default */ }

        const senderName = (tgMsg.from.first_name + (tgMsg.from.last_name ? ` ${tgMsg.from.last_name}` : '')).substring(0, 75) + " [TG]";
        let content = tgMsg.text || tgMsg.caption || "";
        const files = [];

        // 2. Extract Media
        try {
            let fileId = null;
            if (tgMsg.photo) fileId = tgMsg.photo[tgMsg.photo.length - 1].file_id;
            else if (tgMsg.sticker) { 
                // STICKER LOGIC
                if (tgMsg.sticker.is_animated || tgMsg.sticker.is_video) {
                    // It's animated (.tgs or .webm). Use thumbnail if available.
                    if (tgMsg.sticker.thumbnail) fileId = tgMsg.sticker.thumbnail.file_id;
                    else content += " [Animated Sticker]"; // Fallback text
                } else {
                    // Static sticker
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

        // 3. Send via Webhook
        try {
            const webhooks = await channel.fetchWebhooks();
            let webhook = webhooks.find(w => w.name === 'Omni-Bridge');
            if (!webhook) {
                webhook = await channel.createWebhook({ name: 'Omni-Bridge', avatar: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg' });
            }

            if (content || files.length > 0) {
                await webhook.send({
                    content: content,
                    username: senderName,
                    avatarURL: senderAvatar,
                    files: files
                });
            }
        } catch (error) {
            // Fallback Embed
            const embed = new EmbedBuilder()
                .setAuthor({ name: senderName, iconURL: senderAvatar })
                .setDescription(content || "[Media]")
                .setColor(0x0088cc)
                .setTimestamp();
            if (files.length > 0 && !tgMsg.document && !tgMsg.video && !tgMsg.voice) embed.setImage(files[0]);
            
            const payload = { embeds: [embed] };
            if (files.length > 0 && (tgMsg.document || tgMsg.video || tgMsg.voice)) payload.files = files;
            
            if (content || files.length > 0) await channel.send(payload);
        }
    }
};