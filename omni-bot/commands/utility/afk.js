const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'afk',
    description: 'Set AFK status',
    async execute(message, args) {
        const reason = args.join(" ") || "AFK";
        await db.set(`afk_${message.guild.id}_${message.author.id}`, reason);
        message.reply(`💤 I set your AFK: **${reason}**`);
    }
};