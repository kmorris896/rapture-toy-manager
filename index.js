require('dotenv').config();

// ---------- Winston Logger Declarations
const winston = require('winston');
const log_level = process.env.LOG_LEVEL || 'info';
const logger = winston.createLogger({
  level: log_level,
  transports: [
    new winston.transports.Console({format: winston.format.combine(winston.format.colorize(), winston.format.simple())}),
    new winston.transports.File({filename: 'logs/combined.log'})
  ]
});

// ---------- Discord.js Declarations
const {Client, Intents, Discord } = require('discord.js');
const DiscordCollection = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES] });
client.commands = new DiscordCollection.Collection();
client.botConfig = {};    // Holds the bot configuration
client.checkNewArrivalInterval = {};  // Holds the interval for checking for new arrivals
client.logger = logger;


// ---------- Load Commands
const botCommands = require('./commands');
Object.keys(botCommands).map(key => {
  client.commands.set(botCommands[key].name, botCommands[key]);
});

// Start Bot
const TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = process.env.BOT_PREFIX || '&';

client.once('ready', () => {
  logger.info(`Logged in as ${client.user.tag}!`);
  client.logger = logger;
});

client.login(TOKEN);

// Process Messages
client.on('message', msg => {
  // Check to make sure that the message starts with the prefix.  Otherwise, quietly ignore
  if (msg.content.startsWith(PREFIX)) {
    // Remove the prefix and then split the command by arguments.
    const args = msg.content.substring(PREFIX.length).split(/ +/);
    const command = args.shift().toLowerCase();
    logger.info(`Called command: ${command}`);

    if (!client.commands.has(command)) return;

    try {
      client.commands.get(command).execute(msg, args);
    } catch (error) {
      logger.error(error);
      msg.reply('there was an error trying to execute that command!');
    }
  } else if (msg.content.toLowerCase().includes('https://c.lovense.com/c/') === true) {
    logger.debug(`Got a lovense link; processing...`);
    client.commands.get('lovense').execute(msg);
  }
});
