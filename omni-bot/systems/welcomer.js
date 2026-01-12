const { createCanvas, GlobalFonts, loadImage } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

try { GlobalFonts.registerFromPath('C:\\Windows\\Fonts\\arial.ttf', 'Sans'); } catch (e) {}

module.exports = {
    async handleJoin(member) {
        const channelId = await db.get(`guild_${member.guild.id}_welcome_ch`);
        if (!channelId) return;

        const channel = member.guild.channels.cache.get(channelId);
        if (!channel) return;

        // --- DRAWING THE CARD ---
        const w = 700, h = 250;
        const canvas = createCanvas(w, h);
        const ctx = canvas.getContext('2d');

        // 1. Background
        ctx.fillStyle = '#1a1c1f';
        ctx.fillRect(0, 0, w, h);

        // 2. Border/Accent
        ctx.strokeStyle = '#5865F2';
        ctx.lineWidth = 8;
        ctx.strokeRect(0, 0, w, h);

        // 3. Text
        ctx.textAlign = 'center';
        
        // "WELCOME"
        ctx.font = 'bold 36px Sans';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`WELCOME`, w / 2, h / 2 + 20);

        // Username
        ctx.font = '28px Sans';
        ctx.fillStyle = '#AAAAAA';
        ctx.fillText(member.user.username, w / 2, h / 2 + 60);

        // Member Count
        ctx.font = '20px Sans';
        ctx.fillStyle = '#5865F2';
        ctx.fillText(`Member #${member.guild.memberCount}`, w / 2, h / 2 + 95);

        // 4. Avatar (The Fix)
        try {
            // Load user avatar (png format)
            const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 128 });
            const avatar = await loadImage(avatarURL);

            // Draw Circle Clipping
            ctx.save();
            ctx.beginPath();
            ctx.arc(w / 2, 75, 50, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            // Draw Image
            ctx.drawImage(avatar, (w / 2) - 50, 25, 100, 100);
            ctx.restore();

            // Draw Circle Border
            ctx.beginPath();
            ctx.arc(w / 2, 75, 50, 0, Math.PI * 2, true);
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#5865F2';
            ctx.stroke();
        } catch (e) {
            console.log("Could not load avatar for welcome image");
        }

        const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'welcome.png' });
        
        await channel.send({ content: `Welcome ${member}!`, files: [attachment] });
    }
};