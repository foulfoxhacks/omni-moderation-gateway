const si = require('systeminformation');
const os = require('os');
const axios = require('axios');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
require('dotenv').config();

// Helper: Visual Progress Bar
function createBar(value, maxValue, size) {
    const percentage = value / maxValue;
    const progress = Math.round((size * percentage));
    const emptyProgress = size - progress;
    const progressText = '█'.repeat(progress);
    const emptyProgressText = '░'.repeat(emptyProgress);
    const percentageText = Math.round(percentage * 100);
    return `[${progressText}${emptyProgressText}] ${percentageText}%`;
}

// Helper: Measure Event Loop Lag
function getEventLoopLag() {
    return new Promise((resolve) => {
        const start = process.hrtime();
        setImmediate(() => {
            const delta = process.hrtime(start);
            const nanosec = delta[0] * 1e9 + delta[1];
            const ms = nanosec / 1e6;
            resolve(ms);
        });
    });
}

module.exports = {
    // 1. WEBHOOK SENDER (Existing)
    async sendWebhook(title, description, color) {
        if (!process.env.SYSTEM_WEBHOOK_URL) return;
        try {
            await axios.post(process.env.SYSTEM_WEBHOOK_URL, {
                embeds: [{ title, description, color, timestamp: new Date() }]
            });
        } catch (e) { console.error("Webhook Error:", e.message); }
    },

    // 2. DEEP STATS GATHERING (New)
    async getAdvancedStats() {
        try {
            const cpuLoad = await si.currentLoad();
            const mem = await si.mem();
            const lag = await getEventLoopLag();
            
            return {
                cpu: {
                    load: cpuLoad.currentLoad,
                    bar: createBar(cpuLoad.currentLoad, 100, 10),
                    cores: os.cpus().length,
                    model: os.cpus()[0].model
                },
                ram: {
                    used: mem.active,
                    total: mem.total,
                    bar: createBar(mem.active, mem.total, 10),
                    string: `${(mem.active / 1024 / 1024 / 1024).toFixed(2)}GB / ${(mem.total / 1024 / 1024 / 1024).toFixed(2)}GB`
                },
                process: {
                    uptime: process.uptime(),
                    lag: lag.toFixed(2), // ms
                    heap: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) // MB
                },
                os: {
                    platform: `${os.type()} ${os.release()}`,
                    uptime: os.uptime()
                }
            };
        } catch (e) {
            console.error("Health Stats Error:", e);
            return null;
        }
    },

    // 3. AUTO-MONITORING LOOP (To be run every 5 mins)
    async monitorSystem(client) {
        const stats = await this.getAdvancedStats();
        if (!stats) return;

        // Alerts Logic
        const alerts = [];
        if (stats.cpu.load > 90) alerts.push(`🔥 **High CPU Load:** ${stats.cpu.load.toFixed(1)}%`);
        if ((stats.ram.used / stats.ram.total) > 0.90) alerts.push(`💾 **High RAM Usage:** ${stats.ram.string}`);
        if (stats.process.lag > 100) alerts.push(`🐢 **Event Loop Lag:** ${stats.process.lag}ms (Bot is slow)`);

        if (alerts.length > 0) {
            // Find configured channel
            // We iterate guilds to find the health log channel
            client.guilds.cache.forEach(async (guild) => {
                const logId = await db.get(`log_health_${guild.id}`);
                if (logId) {
                    const channel = guild.channels.cache.get(logId);
                    if (channel) {
                        channel.send(`⚠️ **SYSTEM ALERT**\n${alerts.join('\n')}`);
                    }
                }
            });
        }
    }
};