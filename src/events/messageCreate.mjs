export const name = 'messageCreate';
export const once = false;

const XP_POR_MENSAGEM = 5;
const CHANCE_XP_BONUS = 0.1;
const COOLDOWN_XP = 60000; // 1 minuto em milissegundos
const xpCooldowns = new Map();

export async function execute(message) {
  if (message.author.bot) return;

  const userId = message.author.id;
  const now = Date.now();
  const cooldownExpira = xpCooldowns.get(userId);

  if (cooldownExpira && now < cooldownExpira) return;
  xpCooldowns.set(userId, now + COOLDOWN_XP);

  const niveis = message.client.niveis.get(userId) || { xp: 0, mensagens: 0 };
  const nivelAnterior = Math.floor(0.1 * Math.sqrt(niveis.xp));

  let xpGanho = XP_POR_MENSAGEM;
  if (Math.random() < CHANCE_XP_BONUS) {
    xpGanho *= 2;
  }

  niveis.xp += xpGanho;
  niveis.mensagens += 1;
  message.client.niveis.set(userId, niveis);

  const novoNivel = Math.floor(0.1 * Math.sqrt(niveis.xp));

  if (novoNivel > nivelAnterior) {
    const recompensa = novoNivel * 1000;
    const economia = message.client.economia.get(userId) || { saldo: 0, banco: 0 };
    economia.saldo += recompensa;
    message.client.economia.set(userId, economia);

    const embed = {
      color: 0x9B59B6,
      title: '🎉 Novo Nível!',
      description: `Parabéns ${message.author}! Você alcançou o nível **${novoNivel}**!\n\nRecompensa: **R$ ${recompensa.toLocaleString('pt-BR')}**`,
      timestamp: new Date().toISOString()
    };

    message.channel.send({ embeds: [embed] });
  }
  
  if (message.client.conquistas && typeof message.client.conquistas.checarConquistas === 'function') {
    const conquistasNovas = message.client.conquistas.checarConquistas(message.client, userId, { mensagens: niveis.mensagens, xp: niveis.xp });
    
    if (conquistasNovas && conquistasNovas.length > 0) {
      const embed = {
        color: 0xF1C40F,
        title: '🏆 Nova Conquista!',
        description: conquistasNovas.map(c => `**${c.nome}**\n${c.descricao}\nRecompensa: R$ ${c.recompensa.toLocaleString('pt-BR')}`).join('\n\n'),
        timestamp: new Date().toISOString()
      };

      message.channel.send({ embeds: [embed] });
    }
  }
}