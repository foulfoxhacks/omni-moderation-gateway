<div align="center">

# 🌌 OMNI-BOT
### **The Ultimate Discord ↔ Telegram Neural Bridge**

[![Version](https://img.shields.io/badge/Release-v7.0.0-7289da?style=for-the-badge&logo=github)](https://github.com/foulfoxhacks/omni-moderation-gateway)
[![Node](https://img.shields.io/badge/Node.js-v22-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ed?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Status](https://img.shields.io/badge/System-Operational-success?style=for-the-badge)](https://github.com/)

**Omni-Bot** is a high-performance, modular gateway designed to unify your communities. 
Bridging the gap between platforms while delivering professional-grade music and security.

[Explore Docs](#-setup--deployment) • [Command List](#-command-matrix) • [Report Bug](mailto:theinfurnetdev@gmail.com)

---

</div>

## ⚡ Core Ecosystem

### 🌉 The Neural Bridge
> **Omni-Sync Technology:** Experience a borderless chat environment. 
* **Avatar Reflection:** Telegram users appear in Discord via dynamic webhooks, preserving their identity.
* **Zero-Loss Media:** HD images, files, and voice notes synced instantly across platforms.
* **Bi-Directional Edits:** Deleting or editing a message on one platform reflects on the other (where API permissions allow).

### 🎵 Sonic Engine
> **Audiophile Grade:** Optimized for **Node v22** & **FFmpeg**.
* **Source Agnostic:** Direct integration with Spotify, SoundCloud, and YouTube.
* **DSP Filters:** Toggleable BassBoost, Nightcore, and Vaporwave filters on the fly.
* **Persistent Queues:** Sessions are saved to the database; if the bot restarts, your music stays.

### 🛡️ Aegis Security
> **Automated Defense:** Advanced AI scanning for malicious content.
* **Dual-Gate Captcha:** Visual image-based verification for Discord and interactive button-based gates for Telegram.
* **Deep Logs:** Full audit transparency for every administrative action, including ghost-ping detection and deleted message recovery.

---

## 🎮 Specialized Integrations

### 🦊 VRChat Community Tools
* **Instance Tracking:** Announce VRChat instances directly to Discord and Telegram simultaneously.
* **Group Sync:** Automatically ping specific roles (e.g., @VRChat-Alerts) when a new meetup starts.
* **World Info:** Fetch world statistics and thumbnails via the VRChat API.

### 📈 Economy & Engagement
* **Cross-Platform XP:** Level up by being active on either Discord or Telegram.
* **Custom Currency:** Integrated shop for roles, badges, and server perks.
* **Leaderboards:** Real-time global ranking of your most active community members.

---

## ⚙️ Environment Configuration

To run Omni-Bot, create a `.env` file in the root directory and populate it with your credentials:

```env
# --- PLATFORM TOKENS ---
DISCORD_TOKEN=your_discord_bot_token
TELEGRAM_TOKEN=your_telegram_bot_token

# --- BRIDGE SETTINGS ---
DISCORD_CHANNEL_ID=1234567890
TELEGRAM_CHAT_ID=-100123456789
OWNER_ID=your_discord_user_id

# --- APIS ---
YOUTUBE_API_KEY=your_key
TWITCH_CLIENT_ID=your_id
TWITCH_SECRET=your_secret

# --- DATABASE ---
DATABASE_URL=postgresql://user:pass@localhost:5432/omni_db
⌨️ Command MatrixCommandPlatformDescriptionPermission/playDiscordAdds a song from URL or Search to the queue.User/syncBothForce-syncs the bridge if a message is missed.Moderator/banBothGlobally bans a user from both platforms.Administrator/instanceDiscordStarts a VRChat instance announcement.VRC-Host/statsBothView your current XP and Economy balance.User/restartDiscordSecurely reloads the bot modules (Owner only).Developer🛠 Setup & Deployment🐳 Method A: Docker (Preferred)The fastest way to get Omni-Bot online. Everything, including FFmpeg, is pre-configured.Bash# 1. Clone the repository
git clone [https://github.com/foulfoxhacks/omni-moderation-gateway.git](https://github.com/foulfoxhacks/omni-moderation-gateway.git)

# 2. Deploy the container
docker compose up -d --build

# 3. Monitor health
docker logs -f omni-bot
⌨️ Method B: Manual (Bare Metal)Ideal for developers who want to modify the source code or run on custom hardware.StepActionCommand1Preparecd omni-moderation-gateway/omni-bot2Installnpm install3Globalnpm install pm2 -g4Launchpm2 start index.js --name "omni-bot"🗺 Project Roadmap[x] v7.0.0: Node v22 migration and enhanced FFmpeg stability.[ ] v7.1.0: Support for multi-channel bridging (Multiple Discord channels → Multiple Telegram groups).[ ] v7.2.0: Dashboard web UI for real-time log monitoring and economy management.[ ] v8.0.0: AI-powered auto-moderation for image recognition (anti-NSFW filters).🛰 Technical Reference[!TIP]Music Stuttering? Ensure your server has at least 1GB of dedicated RAM.Bridge Silence? Check if the bot has Manage Webhooks permissions in the Discord channel.📬 Contact & ContributionsDeveloped with ❤️ by Sammy (@FoulFoxHacks).If this project helps your community, please consider leaving a ⭐ on the repository![!IMPORTANT]For security reporting or feature requests, please use the following format:Subject: [Omni-Bot] - <Topic Name>Email: theinfurnetdev@gmail.com<div align="center">[ Back To Top ]Omni-Bot © 2026. Built for the future of cross-platform social interaction.</div>
