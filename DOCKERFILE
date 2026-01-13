# Use Node.js 22 (Current)
FROM node:22-slim

# Install system dependencies
# ffmpeg: required for music
# python3/make/g++: required if your dependencies need to compile native code
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files from the sub-folder
COPY omni-bot/package*.json ./

# Install dependencies
RUN npm install --production

# Copy the actual bot code
COPY omni-bot/ .

# Start the bot
CMD [ "node", "index.js" ]
