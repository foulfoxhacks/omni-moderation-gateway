const { EmbedBuilder } = require('discord.js');
const speedTest = require('speedtest-net');

module.exports = {
    name: 'speedtest',
    description: 'Run a network speed test and quality check',
    async execute(message, args) {
        // 1. Send Loading Message
        const loadingEmbed = new EmbedBuilder()
            .setTitle('🚀 Running Network Diagnostics...')
            .setDescription('Please wait 10-20 seconds while we ping external servers...')
            .setColor(0x5865F2)
            .setThumbnail('https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif'); // Loading GIF

        const msg = await message.reply({ embeds: [loadingEmbed] });

        try {
            // 2. Run Speedtest (Accept License, JSON output)
            const result = await speedTest({ acceptLicense: true, acceptGdpr: true });

            // 3. Extract Data
            const dl = (result.download.bandwidth / 125000).toFixed(2); // Convert bytes to Mbps
            const ul = (result.upload.bandwidth / 125000).toFixed(2);
            const ping = result.ping.latency.toFixed(0);
            const jitter = result.ping.jitter.toFixed(0);
            const isp = result.isp;
            const server = result.server.location + ` (${result.server.country})`;

            // 4. Calculate Network Quality Score
            let score = 0;
            if (ping < 20) score += 2;
            else if (ping < 50) score += 1;

            if (dl > 100) score += 2;
            else if (dl > 50) score += 1;

            if (jitter < 5) score += 1;

            let quality = "Unknown";
            let color = 0x95A5A6; // Grey

            if (score >= 5) { quality = "S (Excellent)"; color = 0x2ECC71; } // Green
            else if (score >= 3) { quality = "A (Good)"; color = 0xF1C40F; } // Yellow
            else if (score >= 2) { quality = "B (Fair)"; color = 0xE67E22; } // Orange
            else { quality = "C (Poor)"; color = 0xE74C3C; } // Red

            // 5. Final Embed
            const finalEmbed = new EmbedBuilder()
                .setTitle('📶 Network Speed Results')
                .setColor(color)
                .addFields(
                    { name: '📥 Download', value: `${dl} Mbps`, inline: true },
                    { name: '📤 Upload', value: `${ul} Mbps`, inline: true },
                    { name: '⏱️ Ping', value: `${ping} ms`, inline: true },
                    { name: '📉 Jitter', value: `${jitter} ms`, inline: true },
                    { name: '🏢 ISP', value: isp, inline: true },
                    { name: '📍 Server', value: server, inline: true },
                    { name: '🏆 Quality Grade', value: `**${quality}**`, inline: false }
                )
                .setFooter({ text: "Powered by Ookla" })
                .setTimestamp();

            await msg.edit({ embeds: [finalEmbed] });

        } catch (error) {
            console.error(error);
            const errEmbed = new EmbedBuilder()
                .setTitle("❌ Test Failed")
                .setDescription("Could not connect to speedtest servers. The network might be busy.")
                .setColor(0xE74C3C);
            await msg.edit({ embeds: [errEmbed] });
        }
    }
};