const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'pay',
    description: 'Give money to a user',
    async execute(message, args) {
        const target = message.mentions.users.first();
        const amount = parseInt(args[1]);

        if (!target || isNaN(amount) || amount < 1) return message.reply("Usage: `!pay @User 100`");
        if (target.id === message.author.id) return message.reply("You cannot pay yourself.");

        const bal = await db.get(`money_${message.guild.id}_${message.author.id}`) || 0;
        if (bal < amount) return message.reply("❌ You don't have enough money.");

        await db.sub(`money_${message.guild.id}_${message.author.id}`, amount);
        await db.add(`money_${message.guild.id}_${target.id}`, amount);

        message.reply(`💸 You sent **$${amount}** to **${target.username}**.`);
    }
};