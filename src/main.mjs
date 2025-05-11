import { GatewayIntentBits, Partials } from 'discord.js';
import { BotClient } from './structures/BotClient.mjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, '..', 'config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));

const client = new BotClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember
  ]
});

const TOKEN = config.token;

client.initialize().then(() => {
  client.login(TOKEN);
}).catch(error => {
  console.error('Erro ao inicializar o bot:', error);
});

process.on('unhandledRejection', error => {
  console.error('Erro não tratado:', error);
});

process.on('uncaughtException', error => {
  console.error('Exceção não capturada:', error);
});