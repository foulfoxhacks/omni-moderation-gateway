const Music = require('../../systems/music');
module.exports = {
    name: 'queue',
    description: 'Show song list',
    async execute(message, args) {
        Music.getQueue(message);
    }
};