const Music = require('../../systems/music');
module.exports = {
    name: 'seek',
    description: 'Fast forward to time (in seconds)',
    async execute(message, args) {
        if (!args[0]) return message.reply("Usage: `!seek 60` (to go to 1 minute)");
        Music.seek(message, args[0]);
    }
};