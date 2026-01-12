const { EmbedBuilder, version: djsVersion } = require('discord.js');
const si = require('systeminformation');
const os = require('os');

module.exports = {
    name: 'debug',
    description: 'Host system debug stats',
    async execute(message, args) {
        const msg = await message.reply("⚙️ Gathering system data...");

        // Gather Data
        const cpu = await si.cpu();
        const mem = await si.mem();
        const osInfo = await si.osInfo();
        const network = await si.networkStats();

        // Calculate Process Memory
        const memoryUsage = process.memoryUsage();
        const heapUsed = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
        
        // Network Traffic (Interface 0)
        const netRx = (network[0].rx_sec / 1024).toFixed(2); // KB/s received
        const netTx = (network[0].tx_sec / 1024).toFixed(2); // KB/s sent

        const embed = new EmbedBuilder()
            .setTitle("🛠️ Advanced Debug Stats")
            .setColor(0x5865F2)
            .addFields(
                { 
                    name: '💻 Hardware', 
                    value: `**CPU:** ${cpu.manufacturer} ${cpu.brand}\n**Cores:** ${cpu.cores}\n**Speed:** ${cpu.speed}GHz`, 
                    inline: false 
                },
                { 
                    name: '🧠 Memory', 
                    value: `**Total:** ${(mem.total / 1024 / 1024 / 1024).toFixed(2)} GB\n**Free:** ${(mem.free / 1024 / 1024 / 1024).toFixed(2)} GB\n**Bot Heap:** ${heapUsed} MB`, 
                    inline: true 
                },
                { 
                    name: '🖧 Network Traffic', 
                    value: `**In:** ${netRx} KB/s\n**Out:** ${netTx} KB/s\n**Interface:** ${network[0].iface}`, 
                    inline: true 
                },
                { 
                    name: 'ℹ️ Software', 
                    value: `**OS:** ${osInfo.platform} ${osInfo.release}\n**Node:** ${process.version}\n**Discord.js:** v${djsVersion}`, 
                    inline: false 
                },
                { 
                    name: '⏱️ Uptime', 
                    value: `**Host:** ${(os.uptime() / 3600).toFixed(1)}h\n**Bot:** ${(process.uptime() / 3600).toFixed(2)}h`, 
                    inline: true 
                }
            )
            .setTimestamp();

        await msg.edit({ content: null, embeds: [embed] });
    }
};