import { Client, Collection } from 'discord.js';
import { readdirSync, existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class BotClient extends Client {
  constructor(options) {
    super(options);
    this.commands = new Collection();
    this.buttons = new Collection();
    this.selectMenus = new Collection();
    this.modals = new Collection();
    this.config = new Collection();
    this.cooldowns = new Collection();
    this.economia = new Collection();
    this.niveis = new Collection();
    this.conquistas = new Collection();
    this.clas = new Collection();
    this.loja = new Collection();
    this.dataPath = join(__dirname, '..', 'data');
    this.initializeDataFolder();
    this.economia = new Collection();
    this.niveis = new Collection();
    this.loadData();
  }

  loadData() {
    const dataPath = join(__dirname, '..', 'data');
    if (!existsSync(dataPath)) {
      mkdirSync(dataPath, { recursive: true });
    }

    const economiaPath = join(dataPath, 'economia.json');
    const niveisPath = join(dataPath, 'niveis.json');
    const configPath = join(dataPath, 'config.json');

    if (existsSync(economiaPath)) {
      const economiaData = JSON.parse(readFileSync(economiaPath, 'utf-8'));
      for (const [userId, data] of Object.entries(economiaData)) {
        this.economia.set(userId, data);
      }
    }

    if (existsSync(niveisPath)) {
      const niveisData = JSON.parse(readFileSync(niveisPath, 'utf-8'));
      for (const [userId, data] of Object.entries(niveisData)) {
        this.niveis.set(userId, data);
      }
    }

    if (existsSync(configPath)) {
      const configData = JSON.parse(readFileSync(configPath, 'utf-8'));
      for (const [key, value] of Object.entries(configData)) {
        this.config.set(key, value);
      }
    }
  }

  saveData() {
    const dataPath = join(__dirname, '..', 'data');
    const economiaData = Object.fromEntries(this.economia);
    const niveisData = Object.fromEntries(this.niveis);
    const configData = Object.fromEntries(this.config);

    writeFileSync(join(dataPath, 'economia.json'), JSON.stringify(economiaData, null, 2));
    writeFileSync(join(dataPath, 'niveis.json'), JSON.stringify(niveisData, null, 2));
    writeFileSync(join(dataPath, 'config.json'), JSON.stringify(configData, null, 2));
  }

  async loadCommands() {
    const commandsPath = join(__dirname, '..', 'commands');
    const commandFolders = readdirSync(commandsPath);

    for (const folder of commandFolders) {
      const folderPath = join(commandsPath, folder);
      const commandFiles = readdirSync(folderPath).filter(file => file.endsWith('.mjs'));

      for (const file of commandFiles) {
        const filePath = join(folderPath, file);
        const fileUrl = `file://${filePath}`;
        const command = await import(fileUrl);
        if ('data' in command && 'execute' in command) {
          this.commands.set(command.data.name, command);
        }
      }
    }
  }

  async loadEvents() {
    const eventsPath = join(__dirname, '..', 'events');
    const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.mjs'));

    for (const file of eventFiles) {
      const filePath = join(eventsPath, file);
      const fileUrl = `file://${filePath}`;
      const event = await import(fileUrl);
      if (event.once) {
        this.once(event.name, (...args) => event.execute(...args));
      } else {
        this.on(event.name, (...args) => event.execute(...args));
      }
    }
  }

  async loadComponents() {
    const componentsPath = join(__dirname, '..', 'components');
    const componentTypes = ['buttons', 'selectMenus', 'modals'];

    if (!existsSync(componentsPath)) {
      mkdirSync(componentsPath, { recursive: true });
    }

    for (const type of componentTypes) {
      const typePath = join(componentsPath, type);
      if (!existsSync(typePath)) {
        mkdirSync(typePath, { recursive: true });
        continue;
      }

      const componentFiles = readdirSync(typePath).filter(file => file.endsWith('.mjs'));
      for (const file of componentFiles) {
        const filePath = join(typePath, file);
        const fileUrl = `file://${filePath}`;
        const component = await import(fileUrl);
        if ('customId' in component && 'execute' in component) {
          this[type].set(component.customId, component);
        }
      }
    }
  }

  initializeDataFolder() {
    if (!existsSync(this.dataPath)) {
      mkdirSync(this.dataPath, { recursive: true });
    }

    const collections = ['economia', 'niveis', 'conquistas', 'clas', 'loja'];
    for (const collection of collections) {
      const filePath = join(this.dataPath, `${collection}.json`);
      if (!existsSync(filePath)) {
        writeFileSync(filePath, '{}', 'utf-8');
      }
      const data = JSON.parse(readFileSync(filePath, 'utf-8'));
      for (const [key, value] of Object.entries(data)) {
        this[collection].set(key, value);
      }
    }
  }

  saveData(collection) {
    const filePath = join(this.dataPath, `${collection}.json`);
    const data = Object.fromEntries(this[collection]);
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async initialize() {
    await this.loadCommands();
    await this.loadEvents();
    await this.loadComponents();

    process.on('SIGINT', () => {
      this.saveData();
      process.exit();
    });

    process.on('SIGTERM', () => {
      this.saveData();
      process.exit();
    });

    return this;
  }
}