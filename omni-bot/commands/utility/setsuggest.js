const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'suggest',
    description: 'Submit a suggestion',
    async execute(message, args) {
        const content = args.join(' ');
        if (!content) return message.reply("Usage: `!suggest Add more emojis`");

        const chId = await db.get(`guild_${message.guild.id}_suggest_ch`);
        if (!chId) return message.reply("Suggestions channel not set up.");

        const channel = message.guild.channels.cache.get(chId);
        if (!channel) return message.reply("Suggestion channel deleted.");

        const embed = new EmbedBuilder()
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setTitle("💡 New Suggestion")
            .setDescription(content)
            .setColor(0xF1C40F)
            .setFooter({ text: "Vote below!" })
            .setTimestamp();

        const msg = await channel.send({ embeds: [embed] });
        await msg.react('✅');
        await msg.react('❌');
        // Optionally create a thread
        await msg.startThread({ name: `Suggestion-${message.author.username}`, autoArchiveDuration: 1440 });

        message.reply({ content: "✅ Suggestion sent!", ephemeral: true });
    }
};