import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('conquistas')
  .setDescription('Mostra suas conquistas e progresso');

export const cooldown = 5;

const conquistas = {
  mensageiro: {
    nome: '📨 Mensageiro',
    descricao: 'Envie mensagens no servidor',
    niveis: [
      { nivel: 1, requisito: 100, recompensa: 1000, emoji: '🥉' },
      { nivel: 2, requisito: 500, recompensa: 2500, emoji: '🥈' },
      { nivel: 3, requisito: 1000, recompensa: 5000, emoji: '🥇' }
    ]
  },
  veterano: {
    nome: '⭐ Veterano',
    descricao: 'Alcance níveis no servidor',
    niveis: [
      { nivel: 1, requisito: 5, recompensa: 2000, emoji: '🥉' },
      { nivel: 2, requisito: 15, recompensa: 5000, emoji: '🥈' },
      { nivel: 3, requisito: 30, recompensa: 10000, emoji: '🥇' }
    ]
  },
  milionario: {
    nome: '💰 Milionário',
    descricao: 'Acumule dinheiro no banco',
    niveis: [
      { nivel: 1, requisito: 10000, recompensa: 1000, emoji: '🥉' },
      { nivel: 2, requisito: 50000, recompensa: 3000, emoji: '🥈' },
      { nivel: 3, requisito: 100000, recompensa: 7000, emoji: '🥇' }
    ]
  },
  trabalhador: {
    nome: '💼 Trabalhador',
    descricao: 'Complete trabalhos',
    niveis: [
      { nivel: 1, requisito: 10, recompensa: 1500, emoji: '🥉' },
      { nivel: 2, requisito: 50, recompensa: 4000, emoji: '🥈' },
      { nivel: 3, requisito: 100, recompensa: 8000, emoji: '🥇' }
    ]
  }
};

function verificarProgresso(usuario, tipo, valor) {
  const conquista = conquistas[tipo];
  if (!conquista) return null;

  const progressoAtual = usuario.conquistas?.[tipo]?.nivel || 0;
  const proximoNivel = conquista.niveis.find(n => n.nivel === progressoAtual + 1);

  if (!proximoNivel || valor < proximoNivel.requisito) return null;

  return {
    tipo,
    nivel: proximoNivel.nivel,
    recompensa: proximoNivel.recompensa,
    nome: conquista.nome,
    emoji: proximoNivel.emoji
  };
}

export function checarConquistas(client, userId, dados) {
  const usuario = client.conquistas.get(userId) || { conquistas: {} };
  const economia = client.economia.get(userId) || { saldo: 0, banco: 0 };
  const niveis = client.niveis.get(userId) || { xp: 0, mensagens: 0 };
  
  const conquistasNovas = [];

  const verificacoes = [
    { tipo: 'mensageiro', valor: niveis.mensagens },
    { tipo: 'veterano', valor: Math.floor(0.1 * Math.sqrt(niveis.xp)) },
    { tipo: 'milionario', valor: economia.banco },
    { tipo: 'trabalhador', valor: dados?.trabalhos || 0 }
  ];

  for (const { tipo, valor } of verificacoes) {
    const progresso = verificarProgresso(usuario, tipo, valor);
    if (progresso) {
      usuario.conquistas[tipo] = { nivel: progresso.nivel, data: new Date().toISOString() };
      economia.saldo += progresso.recompensa;
      conquistasNovas.push(progresso);
    }
  }

  if (conquistasNovas.length > 0) {
    client.conquistas.set(userId, usuario);
    client.economia.set(userId, economia);
  }

  return conquistasNovas;
}

export async function execute(interaction) {
  const userId = interaction.user.id;
  const usuario = interaction.client.conquistas.get(userId) || { conquistas: {} };
  const economia = interaction.client.economia.get(userId) || { saldo: 0, banco: 0 };
  const niveis = interaction.client.niveis.get(userId) || { xp: 0, mensagens: 0 };

  const embed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle('🏆 Suas Conquistas')
    .setThumbnail(interaction.user.displayAvatarURL())
    .setDescription('Progresso em todas as conquistas disponíveis:')
    .setTimestamp();

  for (const [tipo, conquista] of Object.entries(conquistas)) {
    const progressoAtual = usuario.conquistas[tipo]?.nivel || 0;
    const proximoNivel = conquista.niveis.find(n => n.nivel === progressoAtual + 1);
    
    let valor;
    switch (tipo) {
      case 'mensageiro':
        valor = niveis.mensagens;
        break;
      case 'veterano':
        valor = Math.floor(0.1 * Math.sqrt(niveis.xp));
        break;
      case 'milionario':
        valor = economia.banco;
        break;
      case 'trabalhador':
        valor = interaction.client.economia.get(userId)?.trabalhos || 0;
        break;
    }

    let status = '';
    if (progressoAtual === 3) {
      status = '✅ Concluído!';
    } else if (proximoNivel) {
      const progresso = Math.floor((valor / proximoNivel.requisito) * 100);
      status = `${progresso}% para Nível ${proximoNivel.nivel} (${valor}/${proximoNivel.requisito})`;
    }

    const nivelEmoji = progressoAtual > 0 ? conquista.niveis[progressoAtual - 1].emoji : '❌';

    embed.addFields({
      name: `${conquista.nome} ${nivelEmoji}`,
      value: `${conquista.descricao}\nNível atual: ${progressoAtual}/3\n${status}`
    });
  }

  await interaction.reply({ embeds: [embed] });
}