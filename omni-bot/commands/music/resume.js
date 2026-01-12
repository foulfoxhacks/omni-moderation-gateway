const Music = require('../../systems/music');
module.exports = {
    name: 'resume',
    description: 'Resume music',
    async execute(message, args) {
        Music.resume(message);
    }
};