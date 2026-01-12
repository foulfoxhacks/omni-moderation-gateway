const Music = require('../../systems/music');

module.exports = {
    name: 'stop',
    description: 'Stop music and leave',
    async execute(message, args) {
        Music.stop(message);
    }
};