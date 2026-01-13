const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'feedback',
    description: 'Send feedback/report to Admins',
    async execute(message, args) {
        const content = args.join(" ");
        if (!content) return message.reply("Usage: `!feedback <Message>`");

        const channelId = await db.get(`guild_${message.guild.id}_feedback_ch`);
        if (!channelId) return message.reply("❌ Feedback system not set up.");

        const channel = message.guild.channels.cache.get(channelId);
        if (!channel) return message.reply("❌ Feedback channel invalid.");

        const embed = new EmbedBuilder()
            .setTitle(`📨 New Feedback`)
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setDescription(content)
            .addFields({ name: 'User ID (For Reply)', value: `\`${message.author.id}\`` })
            .setColor(0xF1C40F)
            .setFooter({ text: "Use !reply <ID> <Msg> to respond" })
            .setTimestamp();

        await channel.send({ embeds: [embed] });
        message.reply("✅ Feedback sent to the administration team.");
    }
};