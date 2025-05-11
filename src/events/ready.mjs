import { ActivityType } from 'discord.js';

export const name = 'ready';
export const once = true;

export async function execute(client) {
  console.log(`Bot online como ${client.user.tag}`);

  const activities = [
    { name: 'Minecraft', type: ActivityType.Playing },
    { name: '/ajuda para comandos', type: ActivityType.Watching },
    { name: `${client.guilds.cache.size} servidores`, type: ActivityType.Watching }
  ];

  let currentIndex = 0;

  setInterval(() => {
    const activity = activities[currentIndex];
    client.user.setActivity(activity.name, { type: activity.type });
    currentIndex = (currentIndex + 1) % activities.length;
  }, 15000);

  client.config.set('ticketCounter', 0);
  client.config.set('ticketCategory', null);
  client.config.set('logChannel', null);
  client.config.set('welcomeChannel', null);
  client.config.set('minecraftServer', null);
}