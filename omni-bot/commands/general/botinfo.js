const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'botinfo',
    description: 'Displays Bot Owner Information',
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setTitle('🦊 Bot Owner: Sammy (FoulFoxHacks)')
            .setDescription("I’m Sammy — also known as FoulFoxHacks — a hobbyist creator and Furry Pup wandering the interwebs,🐾 always learning, building, and doing my part to make the world a little brighter ☯️")
            .setColor(0x2B2D31) // Dark grey/sleek look
            .setThumbnail(message.client.user.displayAvatarURL())
            .setFooter({ text: "Omni-Bot | Developed with ❤️" });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Visit GitHub')
                .setEmoji('🔗')
                .setStyle(ButtonStyle.Link)
                .setURL('https://github.com/foulfoxhacks')
        );

        await message.reply({ embeds: [embed], components: [row] });
    }
};