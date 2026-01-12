const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Displays all available commands',
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setTitle("🤖 Omni-Bot Command List")
            .setDescription("Complete feature list for v7 (Hybrid System)")
            .setColor(0x5865F2)
            .setThumbnail(message.client.user.displayAvatarURL())
            .addFields(
                { 
                    name: '🛠️ Admin & Setup', 
                    value: '`!bridge` `!setlog` `!panels` `!setupverify` `!setupstats` `!setuphub` `!setupstarboard` `!setwelcome` `!setleave` `!setsuggest` `!setxp` `!setvrchat` `!stream` `!addcmd` `!rolepanel` `!addadminrole` `!manageinvites` `!givexp` `!say` `!dm` `!restart`' 
                },
                { 
                    name: '🛡️ Moderation', 
                    value: '`!ban` `!unban` `!kick` `!mute` `!unmute` `!disconnect` `!move` `!warn` `!warnings` `!purge` `!nuke` `!lock` `!unlock` `!slowmode`' 
                },
                { 
                    name: '🔧 Utility & Network', 
                    value: '`!ping` `!speedtest` `!debug` `!health` `!weather` `!callsign` `!serverinfo` `!userinfo` `!avatar` `!tag` `!afk` `!remind` `!suggest` `!vrchat` `!invites`' 
                },
                { 
                    name: '💰 Economy', 
                    value: '`!balance` `!work` `!daily` `!pay`' 
                },
                { 
                    name: '🎵 Music Advanced', 
                    value: '`!play` `!skip` `!stop` `!volume` `!loop` `!shuffle` `!queue` `!np` `!seek` `!back` `!pause` `!resume`' 
                },
                { 
                    name: '🎉 Fun & Social', 
                    value: '`!rank` `!leaderboard` `!poll` `!8ball` `!gstart` `!botinfo`' 
                },
                {
                    name: '✈️ Telegram Native',
                    value: '*(Run inside Telegram)*\n`!ping` `!id` `!stat` `!weather` `!callsign` `!speedtest` `!health` `!debug` `!8ball`'
                }
            )
            .setFooter({ text: "Use !command for details | /active for Badge" });

        await message.reply({ embeds: [embed] });
    }
};