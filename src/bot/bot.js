const { Client, Events, GatewayIntentBits, PermissionFlagsBits, ChannelType, VoiceChannel } = require('discord.js');
const User = require('../models/User')
const encryption = require('../config/encryption');
const Scramble = require('../models/Scramble');
const { StarSystem, Planet, Moon } = require('../models/Location');
const { DateTime } = require('luxon');
const timezoneAbbreviations = require('../config/timezoneAbbreviations');
const token  = process.env.DISCORD_TOKEN;
// Initialize the bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates, // For updates on users joining/leaving voice channels
    8,
  ]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Handle incoming messages
client.on('messageCreate', async (message) => {
  // Prevent the bot from responding to itself or other bots
  if (message.author.bot) return;
  // Custom response to a command
  if (message.content === '!hello') {
    await message.reply('Hello there!');
  }
  if (message.content === '!mute') {
    const response = await setMute(message.author.id, true);
    console.log(response)
    await message.reply('You will no longer receive scramble notes! To start receiving them, please reply !unmute');
  }
  if (message.content === '!unmute') {
    const response = await setMute(message.author.id, false);
    console.log(response)
    await message.reply('You will now receive scramble notes! To stop receiving them, please reply !mute');
  }
  if (message.content.startsWith('!timezone:')) {
    const timezoneString = message.content.split(':')[1];  // Extract timezone string after '!timezone:'  
    await handleTimezoneCommand(message.author.id, timezoneString, message);  // Call the function with parameters
  }
});

//start functions
const handleTimezoneCommand = async (userId, timezoneString, message) => {
  const timezoneCode = timezoneString.trim().toUpperCase();  // Clean up the input string
  console.log(timezoneCode);
  // Check if the provided timezone abbreviation exists in the mapping
  if (timezoneAbbreviations[timezoneCode]) {
    const timezone = timezoneAbbreviations[timezoneCode];
    
    // Validate the timezone using Luxon
    const dt = DateTime.now().setZone(timezone);
    
    if (dt.isValid) {
      // If valid, update the user's timezone
      const response = await setTimezone(userId, timezone);
      await message.reply(`Timezone successfully updated to: ${timezone}. This doesn't actually do anything yet.`);
    } else {
      // If invalid timezone, respond with an error message
      await message.reply('There was an issue with the timezone. Please try again.');
    }
  } else {
    // If the timezone abbreviation is not found, provide a list of valid options
    const timezoneMessage = Object.entries(timezoneAbbreviations)
    .map(([abbreviation, fullName]) => `${abbreviation} (${fullName})`)
    .join(', ');
  await message.reply('Invalid timezone abbreviation. Please use one of the following: ' + timezoneMessage);
}
};

const setTimezone = async(userId, timezone) => {
  try{
    const user = await User.findOne({ discordId: userId });
    if (!user) {
      return 'User not found in the database.';
    }
    user.timezone = timezone;
    await user.save();

    return `TimeZone  updated to ${timezone} for ${encryption.decrypt(user.username)}.`;
  } catch (err) {
    console.error('Error updating TimeZone:', err);
    return 'An error occurred while updating TimeZone.';
  }
}

const setMute = async (userId, mute) => {
  try {
    // Find the user in the database by their Discord ID
    const user = await User.findOne({ discordId: userId });

    if (!user) {
      return 'User not found in the database.';
    }

    // Update the mute status
    user.mute = mute;
    await user.save();

    return `Mute status updated to ${mute ? 'true' : 'false'} for ${encryption.decrypt(user.username)}.`;
  } catch (err) {
    console.error('Error updating mute status:', err);
    return 'An error occurred while updating mute status.';
  }
};

async function pingMembers(scrambleId) {
  try {
    // Fetch all users with mute set to false
    const unmutedUsers = await User.find({ mute: false });
    const guilds = client.guilds.cache;
    const voiceChannel = await startChannel(guilds.find(guild => guild.name === 'AVOG_BOT_TEST') || defaultGuild, scrambleId);    //Todo: add logic to determine which server to put the channel on, this will only put it on AVOG_BOT_TEST
    
    //semi-hardcodding this for testing
    guildId = voiceChannel.guild.id
    channelId = voiceChannel.id

    for (const user of unmutedUsers) {
      const decryptedUsername = encryption.decrypt(user.username);

      guilds.forEach(async (guild) => {
        try {
          const member = await guild.members.fetch(user.discordId);
          //const channelLink = await addUserToChannel(member, voiceChannel)
          const channelLink = `https://discord.com/channels/${guildId}/${channelId}`; //semihardcoded for testing
          if (member) {
            const scramNote = await buildScramnote(scrambleId, user, channelLink)
            await member.send(scramNote);
            console.log(`Message sent to: ${decryptedUsername}`);
          }
        } catch (err) {
          console.error(`Failed to send message to ${decryptedUsername}:`, err.message);
        }
      });
    }
  } catch (err) {
    console.error('Error fetching unmuted users:', err.message);
  }
}

async function startChannel(guild, scrambleId) {
  try {
    const existingChannel = guild.channels.cache.find(channel => channel.name === `${scrambleId}-scramble`);
    if (existingChannel) {
      return existingChannel; // Return existing channel if it already exists
    }

    // Create a new private voice channel
    const channel = await guild.channels.create({
      name: `${scrambleId}-scramble`,
      type: ChannelType.GuildVoice,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.Connect],
        },
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
      ],
    });
    return channel;
  } catch (error) {
    console.error('Error creating voice channel:', error);
  }
}

async function addUserToChannel(member, voiceChannel) {
  try {
    // Fetch the guild where the voice channel exists
    const guild = voiceChannel.guild;
    if (member) {
      console.log(voiceChannel)    
      // Grant permission to the user to connect to the channel
      await voiceChannel.permissionOverwrites.create(member, {
        ViewChannel: true,
      });
      console.log(`Granted access to ${member} and sent the join link.`);
      // Generate the invite link to the voice channel
      return channelLink = `https://discord.com/channels/${guild.id}/${voiceChannel.id}`;
    }
  } catch (error) {
    console.error(`Error adding ${member} to channel:`, error);
  }
}

async function buildScramnote(scrambleId, user, channelLink) {
  try {
    // Fetch the scramble by ID and populate references
    const scramble = await Scramble.findById(scrambleId)
      .populate('targetSystem', 'name') 
      .populate('targetPlanet', 'name') 
      .populate('targetMoon', 'name')
      .populate('initiatingUser', 'username')
      .exec();

    if (!scramble) {
      return `Scramble with ID ${scrambleId} not found.`;
    }
    // Fetch the user's timezone
    const userTimezone = user ? user.timezone : 'UTC'; // Default to UTC if no timezone is found

    // Convert the start time (which is in UTC) to the user's timezone
    const formattedStartTime = DateTime.fromISO(scramble.startTime.toISOString()) // Assumes startTime is ISO format
      .setZone(userTimezone) // Convert it to the user's timezone
      .toLocaleString(DateTime.DATETIME_MED); // Format it in a medium style (you can change the format)
    
      console.log(formattedStartTime)

    // Format the information into a human-readable string
    const {
      name,
      targetSystem,
      targetPlanet,
      targetMoon,
      notes,
      initiatingUser,
    } = scramble;

    const formattedScramble = `
**Scramble Alert!!**
- **Location**: System - ${targetSystem?.name || 'N/A'}, Planet - ${targetPlanet?.name || 'N/A'}, Moon - ${targetMoon?.name || 'N/A'}
- **Time**: ${formattedStartTime} (${userTimezone})
- **Notes**: ${notes || 'No notes provided'}
- **Initiator**: ${initiatingUser?.username || 'Unknown'}
- **Secure Channel**: [Join here](${channelLink})
    `.trim();

    return formattedScramble;
  } catch (error) {
    console.error('Error building scramnote:', error);
    return `An error occurred while building the scramnote: ${error.message}`;
  }
}

async function getMembers() {
  const Guilds = client.guilds.cache;
  Guilds.forEach(async (guild) => {
      try {
          const members = await guild.members.fetch();
          for (const member of members.values()) {
              // Check if the user already exists in the database
              const existingUser = await User.findOne({ discordId: member.user.id });
              
              if (!existingUser) {
                  // Encrypt fields before saving to the database
                  const newUser = await User.create({
                      discordId: member.user.id,
                      username: encryption.encrypt(member.user.username),
                      discriminator: encryption.encrypt(member.user.discriminator),
                      avatar: encryption.encrypt(member.user.avatar || ''), // Default to empty if null\
                      mute: true,
                  });
                  memberNameEnc = newUser.username;
                  memberNameDec = encryption.decrypt(memberNameEnc);
                  console.log(`User created: ${memberNameDec}`);
              } else {
                  memberNameEnc = existingUser.username;
                  memberNameDec = encryption.decrypt(memberNameEnc);
                  console.log(`User already exists: ${memberNameDec}`);
              }
          }
      } catch (error) {
          console.error(`Failed to fetch members for guild ${guild.id}:`, error);
      }
  });
}

async function initialize() {
    try {
      await client.login(token);
      console.log('Bot logged in successfully!');
      getMembers();
    } catch (error) {
      console.error('Bot login failed:', error);
    }
  }

module.exports = {initialize, pingMembers};