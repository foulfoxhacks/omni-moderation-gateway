const Music = require('../../systems/music');
module.exports = {
    name: 'np',
    description: 'Show now playing bar',
    async execute(message, args) {
        Music.nowPlaying(message);
    }
};