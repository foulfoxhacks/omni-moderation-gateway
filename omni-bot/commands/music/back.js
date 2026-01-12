const Music = require('../../systems/music');
module.exports = {
    name: 'back',
    description: 'Play previous song',
    async execute(message, args) {
        Music.back(message);
    }
};