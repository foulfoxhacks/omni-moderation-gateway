const { QuickDB } = require('quick.db');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = new QuickDB();

module.exports = {
    name: 'vrchat',
    description: 'Join VRC group',
    async execute(message, args) {
        const url = await db.get('vrchat_url');
        if(!url) return message.reply("No group link set.");
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('Join VRChat').setStyle(ButtonStyle.Link).setURL(url));
        message.reply({ content: "**VRChat Community**", components: [row] });
    }
};