# 🤖 Omni-Bot: The Ultimate Discord & Telegram Bridge

Omni-Bot is a high-performance, modular management bot that seamlessly bridges **Discord** and **Telegram** while providing advanced music, moderation, economy, and VRChat group management tools.

![Version](https://img.shields.io/badge/version-7.0.0-blue)
![Node](https://img.shields.io/badge/Node.js-v22-green)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![Status](https://img.shields.io/badge/Status-Operational-success)

---

## ✨ Key Features

### 🌉 Cross-Platform Bridge
*   **Bi-Directional Sync:** Real-time chat between Discord and Telegram.
*   **Webhook Identity:** Telegram users appear in Discord with their actual avatars and names.
*   **Media Support:** Seamlessly syncs Images, Videos, Audio, and Files across platforms.

### 🎵 Advanced Music System
*   **Engine:** Optimized for **Node v22** and **FFmpeg** for high-fidelity playback.
*   **Multi-Source:** Supports YouTube, Spotify, and SoundCloud.
*   **Pro Features:** Audio filters (BassBoost, Nightcore), persistent queues, and DJ roles.

### 🛡️ Moderation & Security
*   **Auto-Mod:** Automatic detection of scams, mass-mentions, and malicious links.
*   **Captcha System:** Visual image verification for Discord and button-based for Telegram.
*   **Audit Logging:** Detailed logs for deleted messages, role changes, and health reports.

### 🎮 Integrations
*   **VRChat Manager:** Host instances and announce them with automatic role pings.
*   **Twitch Live:** Real-time stream announcements via Twitch API.
*   **Economy:** Integrated XP, leveling, and custom currency systems.

---


🚀 Deployment Option 1: Docker (Recommended)
--------------------------------------------

Docker is the preferred method as it bundles **Node.js v22** and **FFmpeg** automatically within a secure container.

1.  docker compose up -d --build    
2.  docker logs -f omni-bot
    
🛠️ Deployment Option 2: Manual Installation
--------------------------------------------

Use this method if you wish to run the bot directly on your operating system (Ubuntu, Windows, macOS).

### 1. Prerequisites

*   **Node.js:** v22.0.0 or higher.
    
*   **FFmpeg:** Must be installed and added to your System PATH.
    
    *   **Ubuntu/Debian:** sudo apt update && sudo apt install ffmpeg
        
    *   **MacOS:** brew install ffmpeg
        
    *   **Windows:** Download from [ffmpeg.org](https://www.google.com/url?sa=E&q=https://ffmpeg.org/download.html).
        

### 2. Installation

### Clone the repository  

- git clone https://github.com/foulfoxhacks/omni-moderation-gateway.git  
- cd omni-moderation-gateway  

# Enter the bot directory and install dependencies  
- cd omni-bot
- npm install   

### 3. Execution

**Standard Run:**
- node index.js   

**Using PM2 (Recommended for 24/7 uptime):**
- npm install pm2
- pm2 start index.js --name "omni-bot" 
- pm2 save   

🛠 Troubleshooting
------------------

*   **Music Stuttering:** Ensure FFmpeg is updated. In Docker, this is handled automatically.
    
*   **Bridge Permissions:** If Telegram messages aren't appearing in Discord, ensure the bot has the Manage Webhooks permission in that specific channel.
    
*   **Restart Command:** The !restart command requires your Discord ID to be correctly set in the OWNER\_ID field of the .env file.
    
*   **Manual Node Errors:** If you see native module errors on manual install, run npm rebuild to sync dependencies with your OS.
    

### 📬 Feature Requests & Support

If you have suggestions or encounter bugs, please reach out:

*   **Email:** [theinfurnetdev@gmail.com](https://www.google.com/url?sa=E&q=mailto:theinfurnetdev@gmail.com)
    
*   **Subject:** Feature Request - Omni Moderation Gateway
    

_Developed with ❤️ by Sammy aka FoulFoxHacks._
