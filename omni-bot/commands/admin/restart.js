const Health = require('../../systems/health');
module.exports = {
    name: 'restart',
    description: 'Emergency Restart',
    async execute(message, args) {
        if(message.author.id !== process.env.OWNER_ID) return;
        await message.reply("⚠️ **System Reboot Initiated.**");
        await Health.sendWebhook("⚠️ Manual Restart", `Triggered by ${message.author.tag}`, 0xF1C40F);
        process.exit(1); // PM2 handles the rest
    }
};