# 🤖 Omni-Bot: The Ultimate Discord & Telegram Bridge

Omni-Bot is a high-performance, modular management bot that seamlessly bridges **Discord** and **Telegram** while providing advanced music, moderation, economy, and VRChat group management tools.

![Version](https://img.shields.io/badge/version-7.0.0-blue)
![Node](https://img.shields.io/badge/Node.js-v16.9+-green)
![Status](https://img.shields.io/badge/Status-Operational-success)

## ✨ Key Features

### 🌉 Cross-Platform Bridge
*   **Bi-Directional Sync:** Chat between Discord and Telegram in real-time.
*   **Media Support:** Syncs Images, Videos, Audio, and Files.
*   **Clean Look:** Uses Discord Webhooks to mimic Telegram user profiles.
*   **Sticker Support:** Converts Telegram stickers to viewable images in Discord.

### 🎵 Advanced Music System
*   **Multi-Source:** YouTube, Spotify, SoundCloud, and Direct Streams (Radio).
*   **Pro Features:** Seek, Rewind, Loop (Song/Queue), Shuffle, and Volume Control.
*   **Stability:** Built with `@distube/ytdl-core` and `play-dl` for reliable playback.

### 🛡️ Moderation & Security
*   **Auto-Mod:** Blocks scams and malicious links automatically.
*   **Captcha System:**
    *   **Discord:** Visual Image Captcha to prevent raids.
    *   **Telegram:** Button-based verification for new members.
*   **Logging:** Detailed logs for Voice, Roles, Channels, and Message edits/deletes.
*   **Invite Tracker:** Tracks who invited whom and manages bonus invites.

### 🐺 Community & VRChat
*   **VRChat Manager:** Host and announce instances with role pings.
*   **Leveling:** XP system with level-up announcements.
*   **Economy:** Work, Daily, and Pay commands.

---

## 🚀 Installation

### 1. Prerequisites
*   Node.js v16.9.0 or higher.
*   FFmpeg (for music functionality).
*   A Discord Bot Token & Telegram Bot Token.

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/foulfoxhacks/omni-moderation-gateway.git

# Enter directory
cd omni-bot

# Install dependencies
npm install

# Install PM2 (Process Manager)
npm install -g pm2

# Start with PM2 (Auto-restart enabled)
pm2 start ecosystem.config.js

# View Logs
pm2 logs omni-bot
