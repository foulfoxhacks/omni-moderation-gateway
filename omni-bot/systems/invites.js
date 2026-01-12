const { Collection } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

// In-memory cache
const invitesCache = new Map();

module.exports = {
    // 1. Load on startup
    async cacheInvites(client) {
        // Small delay to ensure guilds are available
        setTimeout(() => {
            client.guilds.cache.forEach(async (guild) => {
                try {
                    const invites = await guild.invites.fetch();
                    invitesCache.set(guild.id, new Collection(invites.map((inv) => [inv.code, inv.uses])));
                } catch (e) {
                    console.log(`Invite Tracker: Missing permissions in ${guild.name}`);
                }
            });
            console.log("✅ Invite Tracker: Cache Loaded");
        }, 5000);
    },

    // 2. Update cache when invites change
    async updateCache(guild) {
        try {
            const invites = await guild.invites.fetch();
            invitesCache.set(guild.id, new Collection(invites.map((inv) => [inv.code, inv.uses])));
        } catch (e) {}
    },

    // 3. Handle Join
    async trackJoin(member) {
        const guildId = member.guild.id;
        const cachedInvites = invitesCache.get(guildId);
        
        let newInvites;
        try {
            newInvites = await member.guild.invites.fetch();
        } catch (e) { return; }

        // Find the invite that incremented
        const usedInvite = newInvites.find(inv => {
            const cachedUses = cachedInvites ? cachedInvites.get(inv.code) : 0;
            return inv.uses > cachedUses;
        });

        // Update Cache
        invitesCache.set(guildId, new Collection(newInvites.map((inv) => [inv.code, inv.uses])));

        if (!usedInvite) return;

        const inviterId = usedInvite.inviter.id;

        // DB Updates
        const key = `invites_${guildId}_${inviterId}`;
        const data = await db.get(key) || { joins: 0, leaves: 0, bonus: 0 };
        
        data.joins += 1;
        await db.set(key, data);
        await db.set(`inviter_${guildId}_${member.id}`, inviterId);

        // LOGGING -> TARGETS #member-logging
        const logId = await db.get(`log_member_${guildId}`);
        if (logId) {
            const channel = member.guild.channels.cache.get(logId);
            if (channel) channel.send(`📥 **${member.user.tag}** joined using code \`${usedInvite.code}\` from **${usedInvite.inviter.tag}**. (${data.joins} total)`);
        }
    },

    // 4. Handle Leave
    async trackLeave(member) {
        const guildId = member.guild.id;
        const inviterId = await db.get(`inviter_${guildId}_${member.id}`);
        if (!inviterId) return;

        const key = `invites_${guildId}_${inviterId}`;
        const data = await db.get(key) || { joins: 0, leaves: 0, bonus: 0 };

        data.leaves += 1;
        await db.set(key, data);

        // LOGGING -> TARGETS #member-logging
        const logId = await db.get(`log_member_${guildId}`);
        if (logId) {
            const channel = member.guild.channels.cache.get(logId);
            const total = (data.joins + data.bonus) - data.leaves;
            if (channel) channel.send(`📤 **${member.user.tag}** left. Invited by <@${inviterId}>. They now have **${total}** invites.`);
        }
    }
};