const Music = require('../../systems/music');
module.exports = {
    name: 'loop',
    description: 'Toggle loop mode',
    async execute(message, args) {
        const mode = args[0]; // off, song, queue
        if (!['off', 'song', 'queue'].includes(mode)) return message.reply("Usage: `!loop <off|song|queue>`");
        Music.setLoop(message, mode);
    }
};