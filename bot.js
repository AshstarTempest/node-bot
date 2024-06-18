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
        ${prefix}deepseek <query> - Sends your query to DeepSeek and returns the response
        \`\`\``);
    message.reply({ embeds: [helpMessage] });
  } else if (command === 'deepseek') {
    try {
      const apiKey = process.env.DEEPSEEK_API_KEY; // Ensure you have this key in your .env
      const data = JSON.stringify({
        messages: [
          {
            content: 'You are a helpful assistant',
            role: 'system',
          },
          {
            content: userInput,
            role: 'user',
          },
        ],
        model: 'deepseek-chat',
        frequency_penalty: 0,
        max_tokens: 2048,
        presence_penalty: 0,
        stop: null,
        stream: false,
        temperature: 1,
        top_p: 1,
        logprobs: false,
        top_logprobs: null,
      });

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.deepseek.com/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        data: data,
      };

      const response = await axios(config);

      if (response.status === 200) {
        message.reply(
          `DeepSeek says: ${response.data.choices[0].message.content}`
        );
      } else {
        console.error('Unexpected response from DeepSeek API:', response);
        message.reply('There was an issue with the DeepSeek API response.');
      }
    } catch (error) {
      console.error(
        'Error fetching data from DeepSeek API:',
        error.response?.data || error.message
      );
      message.reply(
        'There was an error processing your request. Please try again later.'
      );
    }
  } // Add more commands here
});

client.login(process.env.BOT_TOKEN);
