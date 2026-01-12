module.exports = {
    name: '8ball',
    description: 'Ask the magic ball',
    async execute(message, args) {
        if (!args[0]) return message.reply("Ask a question!");
        const answers = ["Yes.", "No.", "Maybe.", "Ask again later.", "Definitely.", "I doubt it."];
        const result = answers[Math.floor(Math.random() * answers.length)];
        message.reply(`🎱 **${result}**`);
    }
};