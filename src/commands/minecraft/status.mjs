import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import util from 'minecraft-server-util';

export const data = new SlashCommandBuilder()
  .setName('status')
  .setDescription('Mostra o status atual do servidor Minecraft');

export const cooldown = 5;

export async function execute(interaction) {
  const serverConfig = interaction.client.config.get('minecraftServer');
  
  if (!serverConfig) {
    const embed = new EmbedBuilder()
      .setColor(0xFF4444)
      .setTitle('❌ Servidor não configurado')
      .setDescription('Use `/config-server` para configurar o servidor Minecraft.')
      .setTimestamp();
    
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  await interaction.deferReply();

  try {
    const options = {
      timeout: 5000,
      enableSRV: true
    };

    const status = await util.status(serverConfig.ip, serverConfig.porta || 25565, options);
    const players = status.players.sample || [];

    const embed = new EmbedBuilder()
      .setColor(0x44FF44)
      .setTitle('📊 Status do Servidor Minecraft')
      .setDescription(`**IP:** ${serverConfig.ip}\n**Porta:** ${serverConfig.porta}`)
      .addFields(
        { name: '🎮 Jogadores', value: `${status.players.online}/${status.players.max}`, inline: true },
        { name: '🔧 Versão', value: status.version.name, inline: true },
        { name: '📶 Latência', value: `${status.roundTripLatency}ms`, inline: true }
      )
      .setTimestamp();

    if (players.length > 0) {
      embed.addFields({
        name: '👥 Jogadores Online',
        value: players.map(p => `• ${p.name}`).join('\n')
      });
    }

    if (status.favicon) {
      embed.setThumbnail(`data:image/png;base64,${status.favicon.split(',')[1]}`);
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    const embed = new EmbedBuilder()
      .setColor(0xFF4444)
      .setTitle('❌ Erro ao obter status')
      .setDescription('Não foi possível conectar ao servidor. Verifique se ele está online.')
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
}