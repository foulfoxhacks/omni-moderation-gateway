const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'reply',
    description: 'Reply to a user via DM',
    async execute(message, args) {
        // Only Admins/Mods
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;

        const userId = args[0];
        const text = args.slice(1).join(" ");

        if (!userId || !text) return message.reply("Usage: `!reply <UserID> <Message>`");

        try {
            // Fetch User
            const target = await message.client.users.fetch(userId);
            
            // Build DM
            const embed = new EmbedBuilder()
                .setTitle(`🔔 Reply from ${message.guild.name}`)
                .setDescription(text)
                .setColor(0x2ECC71) // Green
                .setFooter({ text: `Replied by: ${message.author.tag}` })
                .setTimestamp();

            await target.send({ embeds: [embed] });
            message.reply(`✅ Reply sent to **${target.tag}**.`);

        } catch (e) {
            console.error(e);
            message.reply("❌ Could not send DM. User likely has DMs closed or ID is invalid.");
        }
    }
};