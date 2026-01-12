const Music = require('../../systems/music');

module.exports = {
    name: 'skip',
    description: 'Skip current song',
    async execute(message, args) {
        Music.skip(message);
    }
};