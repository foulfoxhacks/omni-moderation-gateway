module.exports = {
  apps : [{
    name   : "omni-bot",
    script : "./index.js",
    watch  : false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
    },
    // If the bot crashes, wait 3 seconds before restarting
    restart_delay: 3000,
    // Format logs with timestamps
    time: true
  }]
}