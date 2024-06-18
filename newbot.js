require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
} = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

const prefix = process.env.PREFIX || '!'; // Prefix from .env (or default '!')

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const userInput = args.join(' ');

  if (command === 'echo') {
    message.reply(`You said: ${userInput}`);
  } else if (command === 'reverse') {
    const reversedText = userInput.split('').reverse().join('');
    message.reply(`Reversed: ${reversedText}`);
  } else if (command === 'help') {
    const helpMessage = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Available Commands').setDescription(`
        \`\`\`
        ${prefix}echo <message> - Echoes your message back
        ${prefix}reverse <message> - Reverses your message
        ${prefix}help - Shows this help message
        ${prefix}gpt <query> - Sends your query to OpenAI and returns the response
        \`\`\``);
    message.reply({ embeds: [helpMessage] });
  } else if (command === 'gpt') {
    try {
      const apiKey = process.env.OPENAI_API_KEY; // Ensure you have this key in your .env
      const data = JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.',
          },
          {
            role: 'user',
            content: userInput,
          },
        ],
        max_tokens: 2048,
        temperature: 1.0,
      });

      const config = {
        method: 'post',
        url: 'https://api.openai.com/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        data: data,
      };

      const response = await axios(config);

      if (response.status === 200) {
        message.reply(
          `OpenAI says: ${response.data.choices[0].message.content}`
        );
      } else {
        console.error('Unexpected response from OpenAI API:', response);
        message.reply('There was an issue with the OpenAI API response.');
      }
    } catch (error) {
      console.error(
        'Error fetching data from OpenAI API:',
        error.response?.data || error.message
      );
      message.reply(
        'There was an error processing your request. Please try again later.'
      );
    }
  } // Add more commands here
});

client.login(process.env.BOT_TOKEN);
