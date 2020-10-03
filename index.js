require('dotenv').config();
const Discord = require('discord.js');
const TOKEN = process.env.TOKEN;
const PREFIX = '&';

// Discord.js Declarations
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

// Load Commands
const botCommands = require('./commands');
Object.keys(botCommands).map(key => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

// Start Bot
bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

// Process Messages
bot.on('message', msg => {
  if (msg.content.startsWith(PREFIX)) {
    const args = msg.content.substring(PREFIX.length).split(/ +/);
    const command = args.shift().toLowerCase();
    console.info(`Called command: ${command}`);

    if (!bot.commands.has(command)) return;

    try {
      bot.commands.get(command).execute(msg, args);
    } catch (error) {
      console.error(error);
      msg.reply('there was an error trying to execute that command!');
    }
  }
});