import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('cla')
  .setDescription('Sistema de clãs do servidor')
  .addSubcommand(subcommand =>
    subcommand
      .setName('criar')
      .setDescription('Cria um novo clã')
      .addStringOption(option =>
        option
          .setName('nome')
          .setDescription('Nome do clã')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('tag')
          .setDescription('Tag do clã (3-4 caracteres)')
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('info')
      .setDescription('Mostra informações do seu clã ou de outro clã')
      .addStringOption(option =>
        option
          .setName('nome')
          .setDescription('Nome do clã para visualizar')
          .setRequired(false)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('convidar')
      .setDescription('Convida um jogador para seu clã')
      .addUserOption(option =>
        option
          .setName('jogador')
          .setDescription('Jogador para convidar')
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('ranking')
      .setDescription('Mostra o ranking dos clãs')
  );

export const cooldown = 5;

const CUSTO_CRIAR_CLA = 50000;
const MIN_NIVEL_CRIAR_CLA = 10;

export async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();

  switch (subcommand) {
    case 'criar':
      await criarCla(interaction);
      break;
    case 'info':
      await infoCla(interaction);
      break;
    case 'convidar':
      await convidarJogador(interaction);
      break;
    case 'ranking':
      await mostrarRanking(interaction);
      break;
  }
}

async function criarCla(interaction) {
  const userId = interaction.user.id;
  const economia = interaction.client.economia.get(userId) || { saldo: 0, banco: 0 };
  const niveis = interaction.client.niveis.get(userId) || { xp: 0 };
  const nivel = Math.floor(0.1 * Math.sqrt(niveis.xp));

  if (nivel < MIN_NIVEL_CRIAR_CLA) {
    return interaction.reply({
      content: `❌ Você precisa ser nível ${MIN_NIVEL_CRIAR_CLA} para criar um clã!`,
      ephemeral: true
    });
  }

  const saldoTotal = economia.saldo + economia.banco;
  if (saldoTotal < CUSTO_CRIAR_CLA) {
    return interaction.reply({
      content: `❌ Você precisa de R$ ${CUSTO_CRIAR_CLA.toLocaleString('pt-BR')} para criar um clã!`,
      ephemeral: true
    });
  }

  const nome = interaction.options.getString('nome');
  const tag = interaction.options.getString('tag').toUpperCase();

  if (tag.length < 3 || tag.length > 4) {
    return interaction.reply({
      content: '❌ A tag do clã deve ter entre 3 e 4 caracteres!',
      ephemeral: true
    });
  }

  const clas = Array.from(interaction.client.clas.values());
  if (clas.some(c => c.nome.toLowerCase() === nome.toLowerCase())) {
    return interaction.reply({
      content: '❌ Já existe um clã com este nome!',
      ephemeral: true
    });
  }

  if (clas.some(c => c.tag === tag)) {
    return interaction.reply({
      content: '❌ Já existe um clã com esta tag!',
      ephemeral: true
    });
  }

  const novoCla = {
    id: Date.now().toString(),
    nome,
    tag,
    lider: userId,
    membros: [userId],
    nivel: 1,
    xp: 0,
    dataCriacao: new Date().toISOString(),
    vitorias: 0,
    derrotas: 0
  };

  if (economia.saldo >= CUSTO_CRIAR_CLA) {
    economia.saldo -= CUSTO_CRIAR_CLA;
  } else {
    const restante = CUSTO_CRIAR_CLA - economia.saldo;
    economia.saldo = 0;
    economia.banco -= restante;
  }

  interaction.client.clas.set(novoCla.id, novoCla);
  interaction.client.economia.set(userId, economia);

  const embed = new EmbedBuilder()
    .setColor(0x2ECC71)
    .setTitle('⚔️ Clã Criado!')
    .setDescription(`Você criou o clã **${nome}** [${tag}] com sucesso!`)
    .addFields(
      { name: '👑 Líder', value: `<@${userId}>`, inline: true },
      { name: '📊 Nível', value: '1', inline: true },
      { name: '👥 Membros', value: '1', inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function infoCla(interaction) {
  const nomeCla = interaction.options.getString('nome');
  const userId = interaction.user.id;
  let cla;

  if (!nomeCla) {
    cla = Array.from(interaction.client.clas.values()).find(c => c.membros.includes(userId));
    if (!cla) {
      return interaction.reply({
        content: '❌ Você não pertence a nenhum clã! Use `/cla criar` para criar um ou peça um convite.',
        ephemeral: true
      });
    }
  } else {
    cla = Array.from(interaction.client.clas.values()).find(c => c.nome.toLowerCase() === nomeCla.toLowerCase());
    if (!cla) {
      return interaction.reply({
        content: '❌ Clã não encontrado!',
        ephemeral: true
      });
    }
  }

  const xpProximoNivel = Math.pow((cla.nivel + 1) * 1000, 1.2);
  const progresso = Math.floor((cla.xp / xpProximoNivel) * 100);
  const barraProgresso = '█'.repeat(Math.floor(progresso / 5)) + '░'.repeat(20 - Math.floor(progresso / 5));

  const embed = new EmbedBuilder()
    .setColor(0x3498DB)
    .setTitle(`⚔️ ${cla.nome} [${cla.tag}]`)
    .addFields(
      { name: '👑 Líder', value: `<@${cla.lider}>`, inline: true },
      { name: '📊 Nível', value: cla.nivel.toString(), inline: true },
      { name: '👥 Membros', value: cla.membros.length.toString(), inline: true },
      { name: '📈 Progresso', value: `${barraProgresso} ${progresso}%\n${cla.xp}/${xpProximoNivel} XP para o nível ${cla.nivel + 1}` },
      { name: '🏆 Estatísticas', value: `Vitórias: ${cla.vitorias}\nDerrotas: ${cla.derrotas}\nWinrate: ${((cla.vitorias / (cla.vitorias + cla.derrotas)) * 100 || 0).toFixed(1)}%` }
    )
    .setTimestamp();

  if (cla.membros.includes(userId)) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('convidar_membro')
        .setLabel('Convidar Membro')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('gerenciar_cla')
        .setLabel('Gerenciar Clã')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(cla.lider !== userId)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  } else {
    await interaction.reply({ embeds: [embed] });
  }
}

async function convidarJogador(interaction) {
  const userId = interaction.user.id;
  const cla = Array.from(interaction.client.clas.values()).find(c => c.membros.includes(userId));

  if (!cla) {
    return interaction.reply({
      content: '❌ Você não pertence a nenhum clã!',
      ephemeral: true
    });
  }

  if (cla.lider !== userId) {
    return interaction.reply({
      content: '❌ Apenas o líder pode convidar novos membros!',
      ephemeral: true
    });
  }

  const jogador = interaction.options.getUser('jogador');
  if (cla.membros.includes(jogador.id)) {
    return interaction.reply({
      content: '❌ Este jogador já é membro do clã!',
      ephemeral: true
    });
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`aceitar_convite_${cla.id}`)
      .setLabel('Aceitar')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`recusar_convite_${cla.id}`)
      .setLabel('Recusar')
      .setStyle(ButtonStyle.Danger)
  );

  const embed = new EmbedBuilder()
    .setColor(0x3498DB)
    .setTitle('📨 Convite para Clã')
    .setDescription(`Você foi convidado para entrar no clã **${cla.nome}** [${cla.tag}]!\n\nLíder: <@${cla.lider}>\nMembros: ${cla.membros.length}\nNível: ${cla.nivel}`)
    .setTimestamp();

  await interaction.reply({
    content: `✅ Convite enviado para ${jogador}!`,
    ephemeral: true
  });

  await jogador.send({ embeds: [embed], components: [row] });
}

async function mostrarRanking(interaction) {
  const clas = Array.from(interaction.client.clas.values())
    .sort((a, b) => {
      if (a.nivel !== b.nivel) return b.nivel - a.nivel;
      return b.xp - a.xp;
    })
    .slice(0, 10);

  if (clas.length === 0) {
    return interaction.reply({
      content: '❌ Não há clãs registrados ainda!',
      ephemeral: true
    });
  }

  const embed = new EmbedBuilder()
    .setColor(0xF1C40F)
    .setTitle('🏆 Ranking de Clãs')
    .setDescription(clas.map((cla, i) => {
      const medalha = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅';
      return `${medalha} **${i + 1}.** ${cla.nome} [${cla.tag}]\nNível ${cla.nivel} • ${cla.membros.length} membros • WR: ${((cla.vitorias / (cla.vitorias + cla.derrotas)) * 100 || 0).toFixed(1)}%`;
    }).join('\n\n'))
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

export async function handleButton(interaction) {
  const customId = interaction.customId;

  if (customId.startsWith('aceitar_convite_')) {
    const claId = customId.replace('aceitar_convite_', '');
    const cla = interaction.client.clas.get(claId);

    if (!cla) {
      return interaction.reply({
        content: '❌ Este clã não existe mais!',
        ephemeral: true
      });
    }

    cla.membros.push(interaction.user.id);
    interaction.client.clas.set(claId, cla);

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('✅ Convite Aceito!')
      .setDescription(`Você agora é membro do clã **${cla.nome}** [${cla.tag}]!`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (customId.startsWith('recusar_convite_')) {
    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('❌ Convite Recusado')
      .setDescription('Você recusou o convite para o clã.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}