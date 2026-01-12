const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'warn',
    description: 'Warn a user',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return;

        const target = message.mentions.members.first();
        const reason = args.slice(1).join(" ") || "No reason";
        
        if (!target) return message.reply("Usage: `!warn @User Reason`");
        if (target.id === message.author.id) return message.reply("Cannot warn yourself.");

        // Push warning object to DB
        await db.push(`warns_${message.guild.id}_${target.id}`, {
            mod: message.author.tag,
            reason: reason,
            date: new Date().toLocaleDateString()
        });

        message.reply({ embeds: [new EmbedBuilder().setTitle("⚠️ User Warned").setDescription(`**Target:** ${target}\n**Reason:** ${reason}`).setColor(0xF1C40F)] });
    }
};