import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('carteira')
  .setDescription('Mostra seu saldo atual');

export const cooldown = 5;

export async function execute(interaction) {
  const userId = interaction.user.id;
  const economia = interaction.client.economia.get(userId) || { saldo: 0, banco: 0 };
  
  const embed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle('💰 Sua Carteira')
    .setThumbnail(interaction.user.displayAvatarURL())
    .addFields(
      { name: '💵 Dinheiro', value: `R$ ${economia.saldo.toLocaleString('pt-BR')}`, inline: true },
      { name: '🏦 Banco', value: `R$ ${economia.banco.toLocaleString('pt-BR')}`, inline: true },
      { name: '💎 Total', value: `R$ ${(economia.saldo + economia.banco).toLocaleString('pt-BR')}`, inline: true }
    )
    .setFooter({ text: 'Use /trabalhar para ganhar dinheiro!' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}