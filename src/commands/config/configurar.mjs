import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('configurar')
  .setDescription('Configura os canais e funções do bot')
  .addChannelOption(option =>
    option.setName('boas-vindas')
      .setDescription('Canal para mensagens de boas-vindas')
      .setRequired(true))
  .addRoleOption(option =>
    option.setName('cargo-membro')
      .setDescription('Cargo dado automaticamente aos novos membros')
      .setRequired(true))
  .addRoleOption(option =>
    option.setName('cargo-staff')
      .setDescription('Cargo da equipe de suporte para tickets')
      .setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export const cooldown = 10;

export async function execute(interaction) {
  const welcomeChannel = interaction.options.getChannel('boas-vindas');
  const memberRole = interaction.options.getRole('cargo-membro');
  const staffRole = interaction.options.getRole('cargo-staff');

  interaction.client.config.set('welcomeChannel', welcomeChannel.id);
  interaction.client.config.set('memberRole', memberRole.id);
  interaction.client.config.set('staffRole', staffRole.id);

  const embed = new EmbedBuilder()
    .setColor(0x44FF44)
    .setTitle('⚙️ Configurações Atualizadas')
    .setDescription('As configurações do bot foram atualizadas com sucesso!')
    .addFields(
      { name: '👋 Canal de Boas-vindas', value: welcomeChannel.toString(), inline: true },
      { name: '👥 Cargo de Membro', value: memberRole.toString(), inline: true },
      { name: '🛡️ Cargo da Staff', value: staffRole.toString(), inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}