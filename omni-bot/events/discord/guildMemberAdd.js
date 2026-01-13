const Welcomer = require('../../systems/welcomer');
const Invites = require('../../systems/invites');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = async (client, member) => {
    try {
        // 1. INVITE TRACKER (Must run first to compare cache)
        await Invites.trackJoin(member);

        // 2. VISUAL WELCOME CARD
        await Welcomer.handleJoin(member);

        // 3. AUTO-ROLE (Optional)
        // const roleId = await db.get(`guild_${member.guild.id}_autorole`);
        // if (roleId) member.roles.add(roleId).catch(() => {});

    } catch (error) {
        console.error("GuildMemberAdd Error:", error);
    }
};