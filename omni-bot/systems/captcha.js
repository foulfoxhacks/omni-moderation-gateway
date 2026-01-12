const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const { 
    EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, 
    ModalBuilder, TextInputBuilder, TextInputStyle 
} = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

// Try to load system fonts to prevent squares
try {
    GlobalFonts.registerFromPath('C:\\Windows\\Fonts\\arial.ttf', 'Sans');
} catch (e) {}

module.exports = {
    // ====================================================
    // 1. IMAGE GENERATOR (Fixed Crash)
    // ====================================================
    generate() {
        const w = 300, h = 100;
        const canvas = createCanvas(w, h);
        const ctx = canvas.getContext('2d');
        
        // Background
        ctx.fillStyle = '#23272A';
        ctx.fillRect(0, 0, w, h);
        
        // Noise
        for(let i=0; i<30; i++) {
            ctx.strokeStyle = Math.random()>0.5 ? '#7289DA':'#99AAB5';
            ctx.lineWidth = 2; 
            ctx.beginPath(); 
            ctx.moveTo(Math.random()*w, Math.random()*h); 
            ctx.lineTo(Math.random()*w, Math.random()*h); 
            ctx.stroke();
        }
        
        // Text
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let text = '';
        
        ctx.font = 'bold 50px Sans'; 
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for(let i=0; i<5; i++) {
            // Pick character
            const char = chars.charAt(Math.floor(Math.random() * chars.length));
            text += char;

            // Draw character (Fixed: Using variable 'char' instead of array index)
            ctx.save(); 
            ctx.translate(40 + i*50, 50); 
            ctx.rotate((Math.random()*0.4)-0.2);
            ctx.fillText(char, 0, 0); 
            ctx.restore();
        }

        return { buffer: canvas.toBuffer('image/png'), code: text };
    },

    // ====================================================
    // 2. DISCORD HANDLERS
    // ====================================================
    async sendDiscordPanel(channel) {
        const embed = new EmbedBuilder()
            .setTitle("🛡️ Verification")
            .setDescription("Click below to verify you are human.")
            .setColor(0x5865F2);
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('verify_start').setLabel('Verify').setStyle(ButtonStyle.Success).setEmoji('🔐')
        );
        await channel.send({ embeds: [embed], components: [row] });
    },

    async handleDiscordStart(interaction) {
        const { buffer, code } = this.generate();
        await db.set(`cap_${interaction.user.id}`, code);
        
        const attachment = new AttachmentBuilder(buffer, { name: 'captcha.png' });
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('verify_ans').setLabel('Answer').setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({ 
            content: "Please memorize the code below and click Answer.", 
            files: [attachment], 
            components: [row], 
            ephemeral: true 
        });
    },

    async handleDiscordAnswerBtn(interaction) {
        const modal = new ModalBuilder().setCustomId('verify_modal').setTitle('Security Check');
        const input = new TextInputBuilder()
            .setCustomId('code')
            .setLabel("Enter Code")
            .setStyle(TextInputStyle.Short)
            .setMinLength(5)
            .setMaxLength(5);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    },

    async handleDiscordSubmit(interaction) {
        const input = interaction.fields.getTextInputValue('code');
        const real = await db.get(`cap_${interaction.user.id}`);
        
        await db.delete(`cap_${interaction.user.id}`); // Cleanup

        if (real && input.toUpperCase() === real) {
            const roleId = await db.get(`guild_${interaction.guild.id}_verify_role`);
            if (roleId) {
                const role = interaction.guild.roles.cache.get(roleId);
                if (role) {
                    try {
                        await interaction.member.roles.add(role);
                    } catch (e) {
                        return interaction.reply({ content: "❌ Verified, but I lack permissions to give the role.", ephemeral: true });
                    }
                }
            }
            await interaction.reply({ content: "✅ Verified.", ephemeral: true });
        } else {
            await interaction.reply({ content: "❌ Incorrect.", ephemeral: true });
        }
    },

    // ====================================================
    // 3. TELEGRAM HANDLER (Fixed Logic)
    // ====================================================
    async handleTgJoin(client, msg) {
        if(!msg.new_chat_members) return;
        
        for(const m of msg.new_chat_members) {
            if(m.is_bot) continue;
            
            // Mute User
            try { await client.restrictChatMember(msg.chat.id, m.id, { can_send_messages: false }); } catch(e){}
            
            const { buffer, code } = this.generate();
            
            // Create Fakes
            const opts = [code];
            while (opts.length < 4) {
                 const fake = Math.random().toString(36).substring(2, 7).toUpperCase();
                 if (!opts.includes(fake)) opts.push(fake);
            }
            const shuffled = opts.sort(() => Math.random() - 0.5);
            
            // Fixed: Send 'ok' or 'no' in callback_data so index.js understands
            const kb = { 
                inline_keyboard: [ 
                    shuffled.map(o => ({ 
                        text: o, 
                        callback_data: `vc_${m.id}_${o===code?'ok':'no'}` 
                    })) 
                ] 
            };
            
            await client.sendPhoto(msg.chat.id, buffer, { 
                caption: `👋 Welcome ${m.first_name}! Tap the matching code to chat.`, 
                reply_markup: kb 
            });
        }
    }
};