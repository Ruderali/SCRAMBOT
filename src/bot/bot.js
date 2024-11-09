const { Client, GatewayIntentBits } = require('discord.js');
// Initialize the bot client
const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

client.login()