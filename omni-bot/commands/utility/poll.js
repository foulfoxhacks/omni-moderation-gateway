const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'poll',
    description: 'Create a yes/no poll',
    async execute(message, args) {
        const question = args.join(' ');
        if (!question) return message.reply("Usage: `!poll Is pizza good?`");

        const embed = new EmbedBuilder()
            .setTitle("📊 Community Poll")
            .setDescription(question)
            .setColor(0x5865F2)
            .setFooter({ text: `Asked by ${message.author.tag}` });

        const msg = await message.channel.send({ embeds: [embed] });
        await msg.react('👍');
        await msg.react('👎');
        await message.delete().catch(()=>{});
    }
};