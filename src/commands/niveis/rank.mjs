import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('rank')
  .setDescription('Mostra seu nível e experiência atual');

export const cooldown = 5;

function calcularNivel(xp) {
  return Math.floor(0.1 * Math.sqrt(xp));
}

function xpParaProximoNivel(nivel) {
  return Math.pow((nivel + 1) * 10, 2);
}

export async function execute(interaction) {
  const userId = interaction.user.id;
  const niveis = interaction.client.niveis.get(userId) || { xp: 0, mensagens: 0 };
  const nivelAtual = calcularNivel(niveis.xp);
  const xpProximoNivel = xpParaProximoNivel(nivelAtual);
  
  const progresso = Math.floor((niveis.xp / xpProximoNivel) * 100);
  const barraProgresso = '█'.repeat(Math.floor(progresso / 5)) + '░'.repeat(20 - Math.floor(progresso / 5));

  const embed = new EmbedBuilder()
    .setColor(0x9B59B6)
    .setTitle('🏆 Seu Progresso')
    .setThumbnail(interaction.user.displayAvatarURL())
    .addFields(
      { name: '📊 Nível', value: `${nivelAtual}`, inline: true },
      { name: '✨ XP Total', value: `${niveis.xp}`, inline: true },
      { name: '💬 Mensagens', value: `${niveis.mensagens}`, inline: true },
      { name: '📈 Progresso', value: `${barraProgresso} ${progresso}%\n${niveis.xp}/${xpProximoNivel} XP para o nível ${nivelAtual + 1}` }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}