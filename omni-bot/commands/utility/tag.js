const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'tag',
    description: 'Manage tags: create, delete, list',
    async execute(message, args) {
        const sub = args[0];
        const name = args[1]?.toLowerCase();
        const content = args.slice(2).join(" ");
        const key = `tags_${message.guild.id}`;

        // 1. CREATE
        if (sub === 'create' || sub === 'add') {
            if (!name || !content) return message.reply("Usage: `!tag add <name> <content>`");
            const tags = await db.get(key) || {};
            if (tags[name]) return message.reply("❌ Tag already exists.");
            
            tags[name] = content;
            await db.set(key, tags);
            return message.reply(`✅ Tag **${name}** created.`);
        }

        // 2. DELETE
        if (sub === 'delete' || sub === 'remove') {
            if (!name) return message.reply("Usage: `!tag delete <name>`");
            const tags = await db.get(key) || {};
            if (!tags[name]) return message.reply("❌ Tag not found.");
            
            delete tags[name];
            await db.set(key, tags);
            return message.reply(`🗑️ Tag **${name}** deleted.`);
        }

        // 3. LIST
        if (sub === 'list') {
            const tags = await db.get(key) || {};
            const list = Object.keys(tags).join(', ');
            return message.reply(`**Tags:** ${list || "None"}`);
        }

        // 4. FETCH (Default)
        // Check if user typed "!tag name"
        if (sub) {
            const tags = await db.get(key) || {};
            if (tags[sub]) return message.channel.send(tags[sub]);
        }
        
        message.reply("Usage: `!tag <add|delete|list> <name>` or `!tag <name>`");
    }
};