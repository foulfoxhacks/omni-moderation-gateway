const { exec } = require('child_process');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
    name: 'shell',
    description: 'Execute terminal commands (Owner Only)',
    async execute(message, args) {
        // 1. STRICT SECURITY CHECK
        if (message.author.id !== process.env.OWNER_ID) {
            return message.reply("⛔ **ACCESS DENIED.** This incident will be reported.");
        }

        const command = args.join(" ");
        if (!command) return message.reply("Usage: `!shell <command>` (e.g. `!shell ls` or `!shell pm2 list`)");

        // 2. Feedback
        const msg = await message.reply("🖥️ Executing...");

        // 3. Execution
        exec(command, (error, stdout, stderr) => {
            // Combine output and error log
            let output = (stdout || "") + (stderr || "");
            
            if (!output) output = "✅ Command executed successfully with no output.";

            // 4. Handle Long Output (> 2000 chars)
            if (output.length > 1950) {
                const buffer = Buffer.from(output, 'utf-8');
                const attachment = new AttachmentBuilder(buffer, { name: 'terminal-output.txt' });
                
                msg.edit({ 
                    content: "📄 Output was too long, sent as file:", 
                    files: [attachment] 
                });
            } else {
                // Send as Code Block
                msg.edit(`\`\`\`bash\n${output}\n\`\`\``);
            }
        });
    }
};
