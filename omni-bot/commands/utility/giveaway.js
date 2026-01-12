const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
    name: 'gstart',
    description: 'Start a giveaway: !gstart 10m 1 Nitro',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageEvents)) return;

        // Parsing Args
        const timeRaw = args[0];
        const winnersCount = parseInt(args[1]);
        const prize = args.slice(2).join(' ');

        if (!timeRaw || isNaN(winnersCount) || !prize) {
            return message.reply("Usage: `!gstart <Time> <Winners> <Prize>`\nEx: `!gstart 10m 1 Discord Nitro`");
        }

        const duration = ms(timeRaw);
        if (!duration) return message.reply("Invalid time format.");

        // Send Embed
        const embed = new EmbedBuilder()
            .setTitle(`🎉 **GIVEAWAY: ${prize}**`)
            .setDescription(`React with 🎉 to enter!\n\n🕒 **Ends in:** ${timeRaw}\n👑 **Winners:** ${winnersCount}\n👮 **Hosted by:** ${message.author}`)
            .setColor(0x5865F2)
            .setTimestamp(Date.now() + duration);

        const gMsg = await message.channel.send({ embeds: [embed] });
        await gMsg.react('🎉');

        // Delete command
        message.delete().catch(() => {});

        // Timer
        setTimeout(async () => {
            // Re-fetch message to get reactions
            const fetchedMsg = await message.channel.messages.fetch(gMsg.id).catch(() => null);
            if (!fetchedMsg) return;

            const users = await fetchedMsg.reactions.cache.get('🎉').users.fetch();
            // Filter out bot
            const entrants = users.filter(u => !u.bot).map(u => u);

            if (entrants.length === 0) {
                return message.channel.send(`😞 Giveaway for **${prize}** ended with no entrants.`);
            }

            // Select Winners
            const winners = [];
            for (let i = 0; i < winnersCount; i++) {
                if (entrants.length === 0) break;
                const index = Math.floor(Math.random() * entrants.length);
                winners.push(entrants[index]);
                entrants.splice(index, 1); // Remove to prevent duplicates
            }

            const winnerString = winners.map(w => w.toString()).join(', ');
            
            const winEmbed = new EmbedBuilder()
                .setTitle("🎉 GIVEAWAY ENDED")
                .setDescription(`**Prize:** ${prize}\n**Winners:** ${winnerString}`)
                .setColor(0x2ECC71);

            gMsg.reply({ content: `Congratulations ${winnerString}!`, embeds: [winEmbed] });
            gMsg.edit({ embeds: [new EmbedBuilder(embed.data).setTitle("🎉 GIVEAWAY ENDED").setColor(0x2B2D31)] });

        }, duration);
    }
};