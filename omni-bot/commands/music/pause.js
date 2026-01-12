const Music = require('../../systems/music');
module.exports = {
    name: 'pause',
    description: 'Pause/Resume music',
    async execute(message, args) {
        if (args[0] === 'resume') Music.resume(message);
        else Music.pause(message);
    }
};