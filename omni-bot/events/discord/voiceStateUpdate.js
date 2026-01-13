const TempVoice = require('../../systems/tempvoice');
const Logger = require('../../systems/logger');

module.exports = (client, oldState, newState) => {
    // 1. Handle Join-to-Create Logic
    TempVoice.handleVoiceUpdate(oldState, newState);

    // 2. Handle Voice Logging (Join/Leave/Move logs)
    Logger.onVoiceStateUpdate(oldState, newState);
};