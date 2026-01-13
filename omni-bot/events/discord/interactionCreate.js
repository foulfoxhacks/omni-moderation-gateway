const Captcha = require('../../systems/captcha');
const TicketApp = require('../../systems/ticket_app');

module.exports = async (client, interaction) => {
    try {
        // ====================================================
        // 1. SLASH COMMANDS (New for Dev Badge)
        // ====================================================
        // This checks if the interaction is a command like /active
        if (interaction.isChatInputCommand()) {
            if (interaction.commandName === 'active') {
                await interaction.reply({ 
                    content: "✅ **Slash Command Executed!**\n\nTo claim your Active Developer Badge:\n1. Wait at least 24 hours.\n2. Visit: https://discord.com/developers/active-developer",
                    ephemeral: true // Only you can see this message
                });
            }
        }

        // ====================================================
        // 2. BUTTON INTERACTIONS (Existing Logic)
        // ====================================================
        if (interaction.isButton()) {
            const id = interaction.customId;
            if (id === 'verify_start') await Captcha.handleDiscordStart(interaction);
            if (id === 'verify_ans') await Captcha.handleDiscordAnswerBtn(interaction);
            if (id.startsWith('ticket_')) await TicketApp.handleTicketButton(interaction);
            if (id === 'app_start') await TicketApp.handleAppStart(interaction);
        }

        // ====================================================
        // 3. MODAL SUBMISSIONS (Existing Logic)
        // ====================================================
        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'verify_modal') await Captcha.handleDiscordSubmit(interaction);
            if (interaction.customId === 'app_modal') await TicketApp.handleAppSubmit(interaction);
        }

        // ====================================================
        // 4. SELECT MENUS (Existing Logic)
        // ====================================================
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'role_select') {
                await interaction.deferReply({ ephemeral: true });
                const selectedIds = interaction.values;
                const member = interaction.member;
                const allOptionIds = interaction.component.options.map(o => o.value);
                const toRemove = allOptionIds.filter(id => !selectedIds.includes(id));
                const toAdd = selectedIds;

                for (const id of toRemove) if (member.roles.cache.has(id)) await member.roles.remove(id).catch(() => {});
                for (const id of toAdd) if (!member.roles.cache.has(id)) await member.roles.add(id).catch(() => {});

                await interaction.editReply(`✅ Roles Updated!`);
            }
        }

    } catch (error) {
        console.error("Interaction Error:", error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: "❌ Error.", ephemeral: true }).catch(() => {});
        }
    }
};