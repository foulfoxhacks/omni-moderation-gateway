const { EmbedBuilder } = require('discord.js');
const weather = require('weather-js');

module.exports = {
    name: 'weather',
    description: 'Check weather by Zipcode or City',
    async execute(message, args) {
        const query = args.join(" ");
        if (!query) return message.reply("Usage: `!weather <Zipcode/City>`");

        weather.find({ search: query, degreeType: 'F' }, function(err, result) {
            if (err) return message.reply("Error fetching weather.");
            if (!result || result.length === 0) return message.reply("❌ Location not found.");

            const current = result[0].current;
            const location = result[0].location;

            const embed = new EmbedBuilder()
                .setTitle(`🌦️ Weather for ${location.name}`)
                .setColor(0xF1C40F)
                .setThumbnail(current.imageUrl)
                .addFields(
                    { name: '🌡️ Temp', value: `${current.temperature}°F (Feels like ${current.feelslike}°F)`, inline: true },
                    { name: '☁️ Sky', value: current.skytext, inline: true },
                    { name: '💧 Humidity', value: `${current.humidity}%`, inline: true },
                    { name: '💨 Wind', value: current.winddisplay, inline: true },
                    { name: '📍 Coordinates', value: `${location.lat}, ${location.long}`, inline: true }
                )
                .setFooter({ text: `Observed: ${current.observationtime}` });

            message.reply({ embeds: [embed] });
        });
    }
};