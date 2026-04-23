# 🌌 **OMNI‑MODERATION GATEWAY**
### **The Ultimate Discord ↔ Telegram Neural Bridge**

<div align="center">

![Version](https://img.shields.io/badge/Release-v7.0.0-7289da?style=for-the-badge&logo=github)
![Node](https://img.shields.io/badge/Node.js-v22-339933?style=for-the-badge&logo=nodedotjs)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ed?style=for-the-badge&logo=docker)
![Status](https://img.shields.io/badge/System-Operational-success?style=for-the-badge)

**Omni‑Bot** is a high‑performance, modular gateway that unifies Discord and Telegram into one seamless ecosystem.  
Experience borderless chat, audiophile‑grade music, and advanced automated security.

[📦 Setup](#-setup--deployment) • [🧩 Command Matrix](#-command-matrix) • [🐞 Report Issue](mailto:theinfurnetdev@gmail.com)

</div>

---

## ⚡ **Core Ecosystem**

### 🌉 **Neural Bridge**
A next‑generation sync engine designed for zero‑friction communication.

- **Avatar Reflection:** Telegram users appear in Discord via dynamic webhooks.  
- **Zero‑Loss Media:** HD images, files, and voice notes sync instantly.  
- **Bi‑Directional Edits:** Edits and deletions propagate across both platforms.

---

### 🎵 **Sonic Engine**
Audiophile‑grade playback powered by **Node v22** + **FFmpeg**.

- **Universal Sources:** Spotify, SoundCloud, YouTube.  
- **DSP Filters:** BassBoost, Nightcore, Vaporwave.  
- **Persistent Queues:** Music sessions survive restarts.

---

### 🛡️ **Aegis Security**
AI‑powered protection for modern communities.

- **Dual‑Gate Captcha:** Image verification (Discord) + interactive buttons (Telegram).  
- **Deep Logs:** Ghost‑ping detection, message recovery, and full audit trails.

---

## 🎮 **Specialized Integrations**

### 🦊 **VRChat Community Tools**
- **Instance Announcements:** Sync VRChat meetups to both platforms.  
- **Group Alerts:** Auto‑ping `@VRChat-Alerts`.  
- **World Lookup:** Fetch thumbnails and stats via VRChat API.

---

### 📈 **Economy & Engagement**
- **Cross‑Platform XP:** Earn levels from either platform.  
- **Custom Currency:** Buy roles, badges, and perks.

---

## ⚙️ **Environment Configuration**

Create a `.env` file in the project root and populate it with your credentials:

~~~env
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
~~~

---

## 🛠️ **Setup & Deployment**

### 🐳 **Method A: Docker (Recommended)**
Fastest deployment — FFmpeg included.

~~~bash
git clone https://github.com/foulfoxhacks/omni-moderation-gateway.git
docker compose up -d --build
docker logs -f omni-bot
~~~

---

### ⌨️ **Method B: Manual Installation**

| Step | Action   | Command |
|------|----------|---------|
| 1 | Prepare | `cd omni-moderation-gateway/omni-bot` |
| 2 | Install | `npm install` |
| 3 | Global | `npm install pm2 -g` |
| 4 | Launch | `pm2 start index.js --name "omni-bot"` |

---

## 🗺️ **Project Roadmap**

- **v7.0.0:** Node v22 migration + FFmpeg stability  
- **v7.1.0:** Multi‑channel bridging (multi‑Discord ↔ multi‑Telegram)  
- **v7.2.0:** Web dashboard for logs + economy management  
- **v8.0.0:** AI‑powered image moderation

---

## 🛰️ **Technical Reference**

- **Language:** Node.js v22  
- **Datastore:** PostgreSQL / Redis  
- **Libraries:** Discord.js v14+, Telegraf v4+  
- **Media Engine:** FFmpeg 6.0

> **Tip:** Music stuttering? Allocate at least **1GB RAM**.  
> **Silent bridge?** Ensure the bot has **Manage Webhooks** in Discord.

---

## 🧩 **Command Matrix**

> A concise reference of common commands and usage patterns. Adapt these to your server's prefix and permissions.

### Bridge / Sync
- `!bridge start` — Start bridging between configured Discord channel and Telegram chat.  
- `!bridge stop` — Stop the active bridge.  
- `!bridge status` — Show current bridge status and stats.

### Music
- `!play <url|query>` — Add track to queue and start playback.  
- `!skip` — Skip current track.  
- `!queue` — Show current queue.  
- `!filter <bassboost|nightcore|vaporwave>` — Toggle DSP filters.

### Moderation & Security
- `!captcha enable` — Enable dual‑gate captcha.  
- `!logs fetch <user|channel>` — Retrieve audit logs.  
- `!ghostping check` — Scan recent messages for ghost‑pings.

### Economy
- `!xp` — Show your cross‑platform XP.  
- `!shop` — Open the custom currency shop.

> **Note:** Replace `!` with your configured prefix. Some commands require admin or owner permissions.

---

## 📬 **Contact & Contributions**

Developed with ❤️ by **Sammy (@FoulFoxHacks)**.  
If Omni‑Bot powers your community, please consider leaving a ⭐ on the repository.

Contributions, issues, and feature requests are welcome — open a GitHub issue or submit a PR.

---

## 🔐 **Security Reporting**

Use this format when reporting security issues or sensitive bugs:

~~~text
Subject: [Omni-Bot] - <Topic Name>
Email: theinfurnetdev@gmail.com
~~~

---

## 📜 **License**

Include your preferred license here (example below):

~~~text
MIT License

Copyright (c) [2026] [Aleksandr "Sammy" Freeyermuth]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
~~~

---

## 🖼️ **Assets & Badges**

Add or update badges as needed for CI, coverage, or other integrations.

---

<div align="center">
⬆ **Back To Top**
</div>
