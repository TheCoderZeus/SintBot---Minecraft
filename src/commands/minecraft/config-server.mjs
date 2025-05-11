import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import util from 'minecraft-server-util';

export const data = new SlashCommandBuilder()
  .setName('config-server')
  .setDescription('Configura o servidor Minecraft para integração')
  .addStringOption(option =>
    option.setName('ip')
      .setDescription('IP do servidor Minecraft')
      .setRequired(true))
  .addIntegerOption(option =>
    option.setName('porta')
      .setDescription('Porta do servidor (padrão: 25565)')
      .setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export const cooldown = 10;

export async function execute(interaction) {
  const ip = interaction.options.getString('ip');
  const porta = interaction.options.getInteger('porta') || 25565;

  await interaction.deferReply();

  try {
    const status = await util.status(ip, porta);
    interaction.client.config.set('minecraftServer', { ip, porta });

    const embed = new EmbedBuilder()
      .setColor(0x44FF44)
      .setTitle('✅ Servidor Minecraft Configurado')
      .setDescription(`O servidor foi configurado com sucesso!\n\n**IP:** ${ip}\n**Porta:** ${porta}\n**Versão:** ${status.version.name}\n**Jogadores:** ${status.players.online}/${status.players.max}`)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    const embed = new EmbedBuilder()
      .setColor(0xFF4444)
      .setTitle('❌ Erro na Configuração')
      .setDescription('Não foi possível conectar ao servidor. Verifique o IP e a porta fornecidos.')
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
}