const Music = require('../../systems/music');
module.exports = {
    name: 'volume',
    description: 'Set volume (1-200)',
    async execute(message, args) {
        if (!args[0]) return message.reply("Usage: `!volume 50`");
        Music.setVolume(message, args[0]);
    }
};