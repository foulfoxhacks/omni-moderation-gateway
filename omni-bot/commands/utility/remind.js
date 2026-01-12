const ms = require('ms');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'remind',
    description: 'Set a reminder',
    async execute(message, args) {
        const time = args[0];
        const note = args.slice(1).join(" ");

        if (!time || !note) return message.reply("Usage: `!remind 10m Take out trash`");

        const msTime = ms(time);
        if (!msTime) return message.reply("Invalid time.");

        const dueTime = Date.now() + msTime;

        // Save to DB array
        await db.push('reminders', {
            userId: message.author.id,
            channelId: message.channel.id,
            due: dueTime,
            note: note
        });

        message.reply(`⏰ I will remind you in **${time}**: "${note}"`);
    }
};