const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'rank',
    description: 'Check your level',
    async execute(message, args) {
        const xp = await db.get(`xp_${message.guild.id}_${message.author.id}`) || 0;
        const level = Math.floor(0.1 * Math.sqrt(xp));
        message.reply(`📊 **${message.author.username}**\nLevel: ${level}\nTotal XP: ${xp}`);
    }
};