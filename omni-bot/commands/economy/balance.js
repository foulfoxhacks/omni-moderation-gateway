const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'balance',
    description: 'Check your wallet',
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author;
        const bal = await db.get(`money_${message.guild.id}_${target.id}`) || 0;

        const embed = new EmbedBuilder()
            .setTitle(`💰 ${target.username}'s Balance`)
            .setDescription(`**Wallet:** $${bal}`)
            .setColor(0xF1C40F);
        
        message.reply({ embeds: [embed] });
    }
};