const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'ping',
    description: 'Advanced latency check',
    async execute(message, args, client) {
        const sent = await message.reply("🏓 Pinging...");

        // 1. Calculate Roundtrip (Bot Latency)
        const roundtrip = sent.createdTimestamp - message.createdTimestamp;
        
        // 2. Get API Latency (Websocket)
        const api = client.ws.ping;

        // 3. Measure Database Latency (Read/Write)
        const dbStart = Date.now();
        await db.set('ping_test', 'test');
        await db.get('ping_test');
        await db.delete('ping_test');
        const dbLatency = Date.now() - dbStart;

        // 4. Color Logic
        let color = 0x2ECC71; // Green
        if (api > 200 || roundtrip > 500) color = 0xE74C3C; // Red
        else if (api > 100 || roundtrip > 300) color = 0xF1C40F; // Yellow

        const embed = new EmbedBuilder()
            .setTitle("📡 Connection Statistics")
            .setColor(color)
            .addFields(
                { name: '🤖 Bot Latency', value: `\`${roundtrip}ms\``, inline: true },
                { name: '🌐 API Latency', value: `\`${api}ms\``, inline: true },
                { name: '💾 Database', value: `\`${dbLatency}ms\``, inline: true }
            )
            .setFooter({ text: `Shard ID: ${message.guild.shardId}` });

        await sent.edit({ content: null, embeds: [embed] });
    }
};