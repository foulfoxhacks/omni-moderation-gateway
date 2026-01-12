const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'callsign',
    description: 'Lookup US FCC Callsign',
    async execute(message, args) {
        const callsign = args[0];
        if (!callsign) return message.reply("Usage: `!callsign <callsign>` (e.g., W1AW)");

        try {
            const res = await axios.get(`https://callook.info/${callsign}/json`);
            const data = res.data;

            if (data.status === 'INVALID') {
                return message.reply("❌ Callsign not found in FCC database.");
            }

            const embed = new EmbedBuilder()
                .setTitle(`📻 Callsign: ${data.current.callsign}`)
                .setColor(0x0099ff)
                .addFields(
                    { name: '👤 Name', value: data.name || 'Unknown', inline: true },
                    { name: '🎓 Class', value: data.current.operClass || 'Unknown', inline: true },
                    { name: '📍 Address', value: `${data.address.line1}, ${data.address.line2}`, inline: false },
                    { name: '🗺️ Grid', value: data.other.gridsquare || 'N/A', inline: true },
                    { name: '📅 Expires', value: data.other.expiryDate || 'N/A', inline: true },
                    { name: '🆔 FRN', value: data.other.frn || 'N/A', inline: true }
                )
                .setFooter({ text: "Source: callook.info" });

            message.reply({ embeds: [embed] });

        } catch (e) {
            console.error(e);
            message.reply("Error fetching callsign data.");
        }
    }
};