# 🤖 Omni-Bot: The Ultimate Discord & Telegram Multipurpose Bot

Omni-Bot is a high-performance, modular management bot that seamlessly bridges **Discord** and **Telegram** while providing advanced music, moderation, economy, and VRChat group management tools.

![Version](https://img.shields.io/badge/version-7.0.0-blue)
![Node](https://img.shields.io/badge/Node.js-v16.9+-green)
![License](https://img.shields.io/badge/license-MIT-important)
![Status](https://img.shields.io/badge/Status-Operational-success)

---

## 📖 Table of Contents
1. [Key Features](#-key-features)
2. [Technical Architecture](#-technical-architecture)
3. [Installation & Setup](#-installation--setup)
4. [Configuration](#-configuration)
5. [Command Reference](#-command-reference)
6. [VRChat Management](#-vrchat-management)
7. [Troubleshooting](#-troubleshooting)

---

## ✨ Key Features

### 🌉 Cross-Platform Bridge
*   **Bi-Directional Sync:** Chat between Discord and Telegram in real-time with <100ms latency.
*   **Webhook Identity:** Discord users see Telegram members with their actual avatars and names via Webhooks.
*   **Media Handling:** Automatic compression and conversion of media across platforms (Images, Videos, Files).
*   **Sticker Rendering:** Telegram stickers are converted to static images or GIFs for Discord viewing.

### 🎵 Advanced Music System
*   **Multi-Source:** High-fidelity playback from YouTube, Spotify, SoundCloud, and custom HLS streams.
*   **Queue Management:** Persistent queues, vote-skipping, and DJ-role restrictions.
*   **Audio Filters:** Real-time filters including BassBoost, Nightcore, and Vaporwave.
*   **Stability:** Built with `@distube/ytdl-core` for 24/7 uptime.

### 🛡️ Moderation & Security
*   **Gatekeeper Captcha:** Prevents "Join-and-Spam" raids. 
    *   **Discord:** Generates a 6-digit alphanumeric image captcha.
    *   **Telegram:** Interactive inline-button challenge for new members.
*   **Auto-Mod:** Heuristic analysis to detect nitro-scams, token grabbers, and repetitive spam.
*   **Audit Logging:** Detailed logs for deleted messages, updated roles, and voice state changes.

---

## 🏗 Technical Architecture

Omni-Bot is built on a modular event-driven architecture designed for scalability:
*   **Core:** Node.js with `discord.js` v14 and `telegraf` for Telegram.
*   **Audio Engine:** Powered by `DisTube` and `play-dl` for optimized resource management.
*   **Database:** Supports SQLite (local) or MongoDB (cloud) for leveling and economy data.
*   **Bridge Logic:** Uses a mapping system that connects specific Discord `ChannelIDs` to Telegram `ChatIDs`.

---

## 🚀 Installation

### 1. Prerequisites
*   **Node.js:** v16.9.0 or higher.
*   **FFmpeg:** Required for audio processing.
    *   *Linux:* `sudo apt install ffmpeg`
    *   *Windows:* Download from [ffmpeg.org](https://ffmpeg.org/download.html).
*   **Tokens:** Discord Bot Token & Telegram Bot Token.

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/foulfoxhacks/omni-moderation-gateway.git

# Enter directory
cd omni-bot

# Install dependencies
npm install

# Setup Environment Variables
cp .env.example .env
