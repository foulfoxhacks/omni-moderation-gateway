const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'nuke',
    description: 'Clear ALL messages in channel',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return;

        // Confirmation (Safety check)
        if (args[0] !== 'confirm') {
            return message.reply("⚠️ **WARNING:** This will delete the entire channel and recreate it.\nType `!nuke confirm` to proceed.");
        }

        const channel = message.channel;
        const position = channel.position;

        // Clone
        const newChannel = await channel.clone();
        await newChannel.setPosition(position);
        await channel.delete();

        newChannel.send("💥 **Channel Nuked.** Chat has been wiped clean.");
        // Send a GIF for effect
        newChannel.send("https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif");
    }
};