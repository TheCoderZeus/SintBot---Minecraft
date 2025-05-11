import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ajuda')
  .setDescription('Mostra todos os comandos disponíveis do bot');

export const cooldown = 5;

export async function execute(interaction) {
  const { commands } = interaction.client;
  const categories = new Map();

  commands.forEach(command => {
    const category = command.data.name.split('/')[0] || 'Geral';
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category).push(command);
  });

  const embed = new EmbedBuilder()
    .setColor(0x2F3136)
    .setTitle('🎮 Sistema de Ajuda')
    .setDescription('Selecione uma categoria no menu abaixo para ver os comandos disponíveis.')
    .setTimestamp()
    .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });

  const options = Array.from(categories.keys()).map(category => ({
    label: category.charAt(0).toUpperCase() + category.slice(1),
    description: `Comandos da categoria ${category}`,
    value: category,
  }));

  const row = new ActionRowBuilder()
    .addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('help-menu')
        .setPlaceholder('Selecione uma categoria')
        .addOptions(options)
    );

  await interaction.reply({
    embeds: [embed],
    components: [row],
    ephemeral: true
  });
}