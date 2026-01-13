const { createCanvas, GlobalFonts, loadImage } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

// Try to register font (prevents squares on Windows)
try { GlobalFonts.registerFromPath('C:\\Windows\\Fonts\\arial.ttf', 'Sans'); } catch (e) {}

module.exports = {
    async handleLeave(member) {
        // 1. Check for specific Leave Channel first
        let channelId = await db.get(`guild_${member.guild.id}_leave_ch`);
        
        // 2. Fallback to Welcome Channel if no leave channel set
        if (!channelId) {
            channelId = await db.get(`guild_${member.guild.id}_welcome_ch`);
        }

        if (!channelId) return;

        const channel = member.guild.channels.cache.get(channelId);
        if (!channel) return;

        // --- DRAW IMAGE ---
        const w = 700, h = 250;
        const canvas = createCanvas(w, h);
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#1a1c1f';
        ctx.fillRect(0, 0, w, h);

        // Border (Red for Leave)
        ctx.strokeStyle = '#E74C3C';
        ctx.lineWidth = 8;
        ctx.strokeRect(0, 0, w, h);

        ctx.textAlign = 'center';
        
        // Text
        ctx.font = 'bold 36px Sans';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`GOODBYE`, w / 2, h / 2 + 20);

        ctx.font = '28px Sans';
        ctx.fillStyle = '#AAAAAA';
        ctx.fillText(member.user.username, w / 2, h / 2 + 60);

        // Avatar
        try {
            const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 128 });
            const avatar = await loadImage(avatarURL);

            // Circular Clip
            ctx.save();
            ctx.beginPath();
            ctx.arc(w / 2, 75, 50, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, (w / 2) - 50, 25, 100, 100);
            ctx.restore();

            // Avatar Border
            ctx.beginPath();
            ctx.arc(w / 2, 75, 50, 0, Math.PI * 2, true);
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#E74C3C';
            ctx.stroke();
        } catch (e) {
            // Fails silently if user has no avatar or net error, just draws text
        }

        const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'goodbye.png' });
        await channel.send({ content: `**${member.user.tag}** has left the server.`, files: [attachment] });
    }
};