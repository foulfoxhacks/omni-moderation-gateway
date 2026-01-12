const Music = require('../../systems/music');
module.exports = {
    name: 'shuffle',
    description: 'Shuffle queue',
    async execute(message, args) {
        Music.shuffle(message);
    }
};