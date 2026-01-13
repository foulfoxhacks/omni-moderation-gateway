const Starboard = require('../../systems/starboard');
module.exports = (client, reaction, user) => {
    Starboard.handleReaction(reaction, user);
};