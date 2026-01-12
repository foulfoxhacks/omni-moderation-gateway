const { QuickDB } = require('quick.db');
const db = new QuickDB();
const ms = require('ms');

module.exports = {
    name: 'daily',
    description: 'Claim daily reward',
    async execute(message, args) {
        const timeout = 86400000; // 24 hours
        const lastDaily = await db.get(`daily_timer_${message.guild.id}_${message.author.id}`);

        if (lastDaily !== null && timeout - (Date.now() - lastDaily) > 0) {
            return message.reply(`🛑 You already claimed your daily. Try again in **${ms(timeout - (Date.now() - lastDaily))}**.`);
        }

        const amount = 500;
        await db.add(`money_${message.guild.id}_${message.author.id}`, amount);
        await db.set(`daily_timer_${message.guild.id}_${message.author.id}`, Date.now());

        message.reply(`💵 **$${amount}** has been added to your account!`);
    }
};