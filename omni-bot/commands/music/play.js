const Music = require('../../systems/music');

module.exports = {
    name: 'play',
    description: 'Play music from YouTube',
    async execute(message, args) {
        if (!args[0]) return message.reply("Usage: `!play <Search or URL>`");
        await Music.play(message, args.join(" "));
    }
};