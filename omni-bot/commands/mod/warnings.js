const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'warnings',
    description: 'Check user warnings',
    async execute(message, args) {
        const target = message.mentions.members.first() || message.member;
        const warns = await db.get(`warns_${message.guild.id}_${target.id}`) || [];

        if (warns.length === 0) return message.reply("✅ This user has no warnings.");

        const embed = new EmbedBuilder()
            .setTitle(`Warnings for ${target.user.tag}`)
            .setColor(0xF1C40F);

        warns.forEach((w, i) => {
            embed.addFields({ name: `Warn ID: ${i+1}`, value: `**Reason:** ${w.reason}\n**Mod:** ${w.mod}\n**Date:** ${w.date}` });
        });

        message.reply({ embeds: [embed] });
    }
};