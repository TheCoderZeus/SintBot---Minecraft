import { REST, Routes } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync, readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, '..', 'config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));

const commands = [];
const commandsPath = join(__dirname, 'commands');
const commandFolders = readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = join(commandsPath, folder);
  const commandFiles = readdirSync(folderPath).filter(file => file.endsWith('.mjs'));

  for (const file of commandFiles) {
    const filePath = join(folderPath, file);
    const fileUrl = `file://${filePath}`;
    const command = await import(fileUrl);
    if ('data' in command) {
      commands.push(command.data.toJSON());
    }
  }
}

const rest = new REST().setToken(config.token);

try {
  console.log('Iniciando o registro dos comandos...');

  await rest.put(
    Routes.applicationCommands(config.clientId),
    { body: commands },
  );

  console.log('Comandos registrados com sucesso!');
} catch (error) {
  console.error('Erro ao registrar os comandos:', error);
}