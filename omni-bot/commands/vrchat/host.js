const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'host',
    description: 'Announce a VRChat Instance',
    async execute(message, args) {
        // !host <Type> <Link/Location> <Desc>
        const type = args[0]; // e.g., "Group+", "Public", "Friends"
        const link = args[1];
        const desc = args.slice(2).join(" ") || "Come join us!";

        if (!type || !link) return message.reply("Usage: `!host <Type> <Link> [Description]`");

        // Fetch Config
        const channelId = await db.get(`vrc_channel_${message.guild.id}`);
        const roleId = await db.get(`vrc_role_${message.guild.id}`);

        if (!channelId) return message.reply("❌ VRChat channel not set. Use `!vrsetup channel #channel`.");

        const targetChannel = message.guild.channels.cache.get(channelId);
        
        // Build Embed
        const embed = new EmbedBuilder()
            .setTitle(`🐺 VRChat Instance: ${type}`)
            .setDescription(`**Host:** ${message.author}\n**Status:** 🟢 OPEN\n\n📝 ${desc}`)
            .setColor(0x00d2ff) // VRChat Blue
            .setThumbnail(message.author.displayAvatarURL())
            .addFields({ name: 'Join Link', value: `[Click to Launch](${link})` })
            .setFooter({ text: "Omni-Bot VRChat Manager" })
            .setTimestamp();

        // Button
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Launch VRChat').setStyle(ButtonStyle.Link).setURL(link)
        );

        let content = "📢 **New Instance Open!**";
        if (roleId) content += ` <@&${roleId}>`;

        const sentMsg = await targetChannel.send({ content: content, embeds: [embed], components: [row] });
        message.reply(`✅ Instance announced in ${targetChannel}.`);
        
        // Save ID to allow closing later
        await db.set(`vrc_last_instance_${message.author.id}`, { channelId: targetChannel.id, msgId: sentMsg.id });
    }
};