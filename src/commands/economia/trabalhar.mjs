import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('trabalhar')
  .setDescription('Trabalhe para ganhar dinheiro');

export const cooldown = 3600;

const trabalhos = [
  { nome: 'Minerador', salario: [500, 1500], emoji: '⛏️' },
  { nome: 'Lenhador', salario: [400, 1200], emoji: '🪓' },
  { nome: 'Fazendeiro', salario: [300, 1000], emoji: '🌾' },
  { nome: 'Pescador', salario: [200, 800], emoji: '🎣' },
  { nome: 'Caçador', salario: [600, 1800], emoji: '🏹' }
];

export async function execute(interaction) {
  const trabalho = trabalhos[Math.floor(Math.random() * trabalhos.length)];
  const ganhos = Math.floor(Math.random() * (trabalho.salario[1] - trabalho.salario[0])) + trabalho.salario[0];
  
  const userId = interaction.user.id;
  const economia = interaction.client.economia.get(userId) || { saldo: 0, banco: 0 };
  economia.saldo += ganhos;
  interaction.client.economia.set(userId, economia);

  const embed = new EmbedBuilder()
    .setColor(0x2ECC71)
    .setTitle(`${trabalho.emoji} Trabalho Concluído!`)
    .setDescription(`Você trabalhou como **${trabalho.nome}** e ganhou **R$ ${ganhos.toLocaleString('pt-BR')}**!\n\nSeu novo saldo: R$ ${economia.saldo.toLocaleString('pt-BR')}`)
    .setFooter({ text: 'Você pode trabalhar novamente em 1 hora!' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}