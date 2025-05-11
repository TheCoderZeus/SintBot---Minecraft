import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('criar-ticket')
  .setDescription('Cria um painel de tickets para suporte')
  .addChannelOption(option =>
    option.setName('categoria')
      .setDescription('Categoria onde os tickets serão criados')
      .setRequired(true))
  .addChannelOption(option =>
    option.setName('logs')
      .setDescription('Canal para logs de tickets')
      .setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export const cooldown = 10;

export async function execute(interaction) {
  const categoria = interaction.options.getChannel('categoria');
  const logs = interaction.options.getChannel('logs');

  interaction.client.config.set('ticketCategory', categoria.id);
  interaction.client.config.set('logChannel', logs.id);

  const embed = new EmbedBuilder()
    .setColor(0x2F3136)
    .setTitle('🎫 Central de Suporte')
    .setDescription('Clique em um dos botões abaixo para abrir um ticket de acordo com sua necessidade.')
    .addFields(
      { name: '📝 Dúvidas', value: 'Tire suas dúvidas sobre o servidor' },
      { name: '🛠️ Suporte', value: 'Reporte problemas ou bugs' },
      { name: '💎 VIP', value: 'Informações sobre VIP e compras' }
    )
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('ticket-duvidas')
        .setLabel('Dúvidas')
        .setEmoji('📝')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('ticket-suporte')
        .setLabel('Suporte')
        .setEmoji('🛠️')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('ticket-vip')
        .setLabel('VIP')
        .setEmoji('💎')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.reply({ embeds: [embed], components: [row] });
}