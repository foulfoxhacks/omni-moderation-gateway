const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    // --- TICKETS (Unchanged) ---
    async handleTicketButton(interaction) {
        if (interaction.customId === 'ticket_create') {
            await interaction.deferReply({ ephemeral: true });
            
            const existing = interaction.guild.channels.cache.find(c => c.name === `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`);
            if (existing) return interaction.editReply(`You already have a ticket: ${existing}`);

            const channel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                    { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
                ]
            });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ticket_close').setLabel('Close Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒')
            );
            await channel.send({ content: `${interaction.user} Welcome to support.`, components: [row] });
            await interaction.editReply(`Ticket created: ${channel}`);
        }

        if (interaction.customId === 'ticket_close') {
            await interaction.reply("Saving transcript and closing...");
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            const text = messages.reverse().map(m => `${m.author.tag} (${m.createdAt.toLocaleString()}): ${m.content}`).join('\n');
            const buffer = Buffer.from(text, 'utf-8');
            const attachment = new AttachmentBuilder(buffer, { name: `transcript-${interaction.channel.name}.txt` });

            const logId = await db.get(`log_transcript_${interaction.guild.id}`);
            if (logId) {
                const logCh = interaction.guild.channels.cache.get(logId);
                if (logCh) await logCh.send({ content: `Ticket Closed: ${interaction.channel.name}`, files: [attachment] });
            }
            setTimeout(() => interaction.channel.delete(), 5000);
        }
    },

    // --- MEMBER APPLICATIONS (Updated) ---
    async handleAppStart(interaction) {
        const modal = new ModalBuilder().setCustomId('app_modal').setTitle('Community Verification');
        
        // Question 1: Age: Confirm your DOB?
        const q1 = new TextInputBuilder().setCustomId('q_age').setLabel("How old are you?").setStyle(TextInputStyle.Short).setMaxLength(3).setRequired(true);
        
        // Question 2: Fursona/Species: Brief description about yourself?
        const q2 = new TextInputBuilder().setCustomId('q_sona').setLabel("Tell us about your Sona/Species").setStyle(TextInputStyle.Short).setRequired(true);
        
        // Question 3: Intro/Vibe Check
        const q3 = new TextInputBuilder().setCustomId('q_intro').setLabel("How did you find us / Intro").setStyle(TextInputStyle.Paragraph).setRequired(true);
		
		// Question 4: If accepted you agree to the rules and or follow-up?
        const q4 = new TextInputBuilder().setCustomId('q_intro').setLabel("How did you find us / Intro").setStyle(TextInputStyle.Paragraph).setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(q1),
            new ActionRowBuilder().addComponents(q2),
            new ActionRowBuilder().addComponents(q3)
        );
        
        await interaction.showModal(modal);
    },

    async handleAppSubmit(interaction) {
        const age = interaction.fields.getTextInputValue('q_age');
        const sona = interaction.fields.getTextInputValue('q_sona');
        const intro = interaction.fields.getTextInputValue('q_intro');

        const logId = await db.get(`log_app_pending_${interaction.guild.id}`);
        
        if (logId) {
            const logCh = interaction.guild.channels.cache.get(logId);
            const embed = new EmbedBuilder()
                .setTitle(`🐾 New Member Application`)
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .addFields(
                    { name: '🎂 Age', value: age, inline: true },
                    { name: '🦊 Sona', value: sona, inline: true },
                    { name: '📝 Intro', value: intro }
                )
                .setColor(0x2ECC71)
                .setFooter({ text: `User ID: ${interaction.user.id}` })
                .setTimestamp();
            
            // Add Accept/Deny Buttons
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`app_accept_${interaction.user.id}`).setLabel('Accept').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`app_deny_${interaction.user.id}`).setLabel('Deny').setStyle(ButtonStyle.Danger)
            );

            if (logCh) await logCh.send({ content: `Application from ${interaction.user}`, embeds: [embed], components: [row] });
            await interaction.reply({ content: "✅ Application received! Moderators will review it shortly.", ephemeral: true });
        } else {
            await interaction.reply({ content: "❌ Application system is not configured (Missing Log Channel).", ephemeral: true });
        }
    }
};