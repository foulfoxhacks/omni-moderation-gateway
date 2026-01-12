const { QuickDB } = require('quick.db');
const db = new QuickDB();
const ms = require('ms');

module.exports = {
    name: 'work',
    description: 'Work to earn cash',
    async execute(message, args) {
        const userId = message.author.id;
        const guildId = message.guild.id;
        
        // Cooldown Check (1 hour)
        const timeout = 3600000; 
        const lastWork = await db.get(`work_timer_${guildId}_${userId}`);

        if (lastWork !== null && timeout - (Date.now() - lastWork) > 0) {
            const timeObj = ms(timeout - (Date.now() - lastWork));
            return message.reply(`🛑 You are tired! Come back in **${timeObj}**.`);
        }

        // Earn Amount (50 - 200)
        const amount = Math.floor(Math.random() * 150) + 50;
        
        await db.add(`money_${guildId}_${userId}`, amount);
        await db.set(`work_timer_${guildId}_${userId}`, Date.now());

        const jobs = ["Developer", "Discord Mod", "Uber Driver", "Pizza Chef", "Streamer"];
        const job = jobs[Math.floor(Math.random() * jobs.length)];

        message.reply(`👷 You worked as a **${job}** and earned **$${amount}**.`);
    }
};