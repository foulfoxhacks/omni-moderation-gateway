const { PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'rolepanel',
    description: 'Create a role dropdown menu',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        // Example: !rolepanel @Red @Blue @Green
        const roles = message.mentions.roles;
        if (roles.size === 0) return message.reply("Usage: `!rolepanel @Role1 @Role2`");

        const options = roles.map(role => 
            new StringSelectMenuOptionBuilder()
                .setLabel(role.name)
                .setValue(role.id)
                .setDescription(`Get the ${role.name} role`)
                .setEmoji('🛡️')
        );

        const select = new StringSelectMenuBuilder()
            .setCustomId('role_select')
            .setPlaceholder('Select your roles...')
            .addOptions(options)
            .setMinValues(0)
            .setMaxValues(roles.size); // Allow multiple selection

        const row = new ActionRowBuilder().addComponents(select);

        const embed = new EmbedBuilder()
            .setTitle("🎭 Self Roles")
            .setDescription("Select the roles you want from the menu below.")
            .setColor(0x5865F2);

        await message.channel.send({ embeds: [embed], components: [row] });
    }
};