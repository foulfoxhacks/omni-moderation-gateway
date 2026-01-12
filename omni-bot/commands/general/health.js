const HealthSys = require('../../systems/health');
const { EmbedBuilder, version: djsVersion } = require('discord.js');

module.exports = {
    name: 'health',
    description: 'Advanced System Telemetry',
    async execute(message, args) {
        const msg = await message.reply("🛰️ Analyzing system telemetry...");
        
        const s = await HealthSys.getAdvancedStats();
        if (!s) return msg.edit("❌ Failed to fetch stats.");

        // Color Logic based on health
        let color = 0x2ECC71; // Green
        if (s.cpu.load > 70 || s.process.lag > 50) color = 0xF1C40F; // Yellow
        if (s.cpu.load > 90 || s.process.lag > 200) color = 0xE74C3C; // Red

        const embed = new EmbedBuilder()
            .setTitle("🖥️ System Status Dashboard")
            .setColor(color)
            .setThumbnail(message.client.user.displayAvatarURL())
            .addFields(
                { 
                    name: '🔥 CPU Load', 
                    value: `\`${s.cpu.bar}\`\n**Model:** ${s.cpu.model}\n**Cores:** ${s.cpu.cores}`, 
                    inline: false 
                },
                { 
                    name: '💾 Memory Usage', 
                    value: `\`${s.ram.bar}\`\n**Usage:** ${s.ram.string}`, 
                    inline: false 
                },
                { 
                    name: '⚙️ Process Internals', 
                    value: `**Event Loop Lag:** \`${s.process.lag}ms\`\n**Heap Usage:** \`${s.process.heap} MB\`\n**Bot Uptime:** <t:${Math.floor(Date.now()/1000 - s.process.uptime)}:R>`, 
                    inline: true 
                },
                { 
                    name: 'ℹ️ Environment', 
                    value: `**OS:** ${s.os.platform}\n**Node:** ${process.version}\n**D.JS:** v${djsVersion}`, 
                    inline: true 
                }
            )
            .setFooter({ text: "Omni-Bot Sentinel System" })
            .setTimestamp();

        await msg.edit({ content: null, embeds: [embed] });
    }
};