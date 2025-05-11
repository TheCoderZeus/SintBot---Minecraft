import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('loja')
  .setDescription('Acesse a loja para comprar itens e benefícios');

export const cooldown = 3;

const categorias = {
  minecraft: {
    nome: '🎮 Minecraft',
    itens: [
      { id: 'vip_basico', nome: 'VIP Básico', preco: 10000, descricao: 'Acesso a comandos exclusivos e tag especial', emoji: '⭐' },
      { id: 'vip_plus', nome: 'VIP Plus', preco: 25000, descricao: 'Todos os benefícios do VIP Básico + teleporte e kit diário', emoji: '💫' },
      { id: 'vip_ultra', nome: 'VIP Ultra', preco: 50000, descricao: 'Todos os benefícios anteriores + fly e comandos de clima', emoji: '👑' }
    ]
  },
  boosters: {
    nome: '🚀 Boosters',
    itens: [
      { id: 'xp_boost', nome: 'Boost de XP (24h)', preco: 5000, descricao: 'Ganhe 2x mais XP por 24 horas', emoji: '✨' },
      { id: 'money_boost', nome: 'Boost de Money (24h)', preco: 7500, descricao: 'Ganhe 2x mais dinheiro por 24 horas', emoji: '💰' },
      { id: 'combo_boost', nome: 'Combo Boost (24h)', preco: 10000, descricao: 'Ganhe 2x mais XP e dinheiro por 24 horas', emoji: '🌟' }
    ]
  },
  cosmeticos: {
    nome: '🎨 Cosméticos',
    itens: [
      { id: 'titulo_lendario', nome: 'Título Lendário', preco: 15000, descricao: 'Título exclusivo para seu perfil', emoji: '📜' },
      { id: 'cor_nome', nome: 'Cor do Nome', preco: 20000, descricao: 'Personalize a cor do seu nome', emoji: '🎨' },
      { id: 'efeito_chat', nome: 'Efeito no Chat', preco: 30000, descricao: 'Adicione efeitos especiais às suas mensagens', emoji: '💬' }
    ]
  }
};

export async function execute(interaction) {
  const userId = interaction.user.id;
  const economia = interaction.client.economia.get(userId) || { saldo: 0, banco: 0, inventario: [] };
  
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('categoria_loja')
    .setPlaceholder('Selecione uma categoria')
    .addOptions(
      Object.entries(categorias).map(([id, categoria]) => ({
        label: categoria.nome,
        value: id,
        emoji: categoria.nome.split(' ')[0]
      }))
    );

  const row = new ActionRowBuilder().addComponents(selectMenu);

  const embed = new EmbedBuilder()
    .setColor(0xFFA500)
    .setTitle('🏪 Loja do Servidor')
    .setDescription(`Bem-vindo à loja! Você tem **R$ ${(economia.saldo + economia.banco).toLocaleString('pt-BR')}**\nSelecione uma categoria para ver os itens disponíveis.`)
    .addFields(
      Object.values(categorias).map(categoria => ({
        name: categoria.nome,
        value: `${categoria.itens.length} itens disponíveis`,
        inline: true
      }))
    )
    .setFooter({ text: 'Use /carteira para ver seu saldo' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], components: [row] });
}

export async function handleSelectMenu(interaction) {
  if (interaction.customId !== 'categoria_loja') return;

  const categoria = categorias[interaction.values[0]];
  const userId = interaction.user.id;
  const economia = interaction.client.economia.get(userId) || { saldo: 0, banco: 0, inventario: [] };

  const embed = new EmbedBuilder()
    .setColor(0xFFA500)
    .setTitle(`${categoria.nome} - Itens Disponíveis`)
    .setDescription(`Seu saldo: **R$ ${(economia.saldo + economia.banco).toLocaleString('pt-BR')}**`)
    .addFields(
      categoria.itens.map(item => ({
        name: `${item.emoji} ${item.nome} - R$ ${item.preco.toLocaleString('pt-BR')}`,
        value: `${item.descricao}\n${economia.inventario.includes(item.id) ? '**[JÁ POSSUI]**' : ''}`
      }))
    )
    .setFooter({ text: 'Clique no botão do item desejado para comprar' })
    .setTimestamp();

  const buttons = categoria.itens.map(item => 
    new ButtonBuilder()
      .setCustomId(`comprar_${item.id}`)
      .setLabel(item.nome)
      .setEmoji(item.emoji)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(economia.inventario.includes(item.id))
  );

  const rows = [];
  for (let i = 0; i < buttons.length; i += 3) {
    rows.push(
      new ActionRowBuilder().addComponents(buttons.slice(i, i + 3))
    );
  }

  const voltarMenu = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('voltar_loja')
      .setLabel('Voltar ao Menu Principal')
      .setStyle(ButtonStyle.Secondary)
  );

  rows.push(voltarMenu);

  await interaction.update({ embeds: [embed], components: rows });
}

export async function handleButton(interaction) {
  if (interaction.customId === 'voltar_loja') {
    return execute(interaction);
  }

  if (!interaction.customId.startsWith('comprar_')) return;

  const itemId = interaction.customId.replace('comprar_', '');
  const item = Object.values(categorias)
    .flatMap(cat => cat.itens)
    .find(i => i.id === itemId);

  if (!item) return;

  const userId = interaction.user.id;
  const economia = interaction.client.economia.get(userId) || { saldo: 0, banco: 0, inventario: [] };
  const saldoTotal = economia.saldo + economia.banco;

  if (saldoTotal < item.preco) {
    return interaction.reply({
      content: `❌ Você não tem dinheiro suficiente para comprar ${item.nome}! Faltam R$ ${(item.preco - saldoTotal).toLocaleString('pt-BR')}.`,
      ephemeral: true
    });
  }

  if (economia.inventario.includes(item.id)) {
    return interaction.reply({
      content: `❌ Você já possui ${item.nome}!`,
      ephemeral: true
    });
  }

  if (economia.saldo >= item.preco) {
    economia.saldo -= item.preco;
  } else {
    const restante = item.preco - economia.saldo;
    economia.saldo = 0;
    economia.banco -= restante;
  }

  economia.inventario.push(item.id);
  interaction.client.economia.set(userId, economia);

  const embed = new EmbedBuilder()
    .setColor(0x2ECC71)
    .setTitle('✅ Compra Realizada!')
    .setDescription(`Você comprou **${item.nome}** por **R$ ${item.preco.toLocaleString('pt-BR')}**!\n\nSeu novo saldo: R$ ${(economia.saldo + economia.banco).toLocaleString('pt-BR')}`)
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
  
  const categoriaId = Object.entries(categorias)
    .find(([, cat]) => cat.itens.some(i => i.id === itemId))[0];

  handleSelectMenu({
    ...interaction,
    customId: 'categoria_loja',
    values: [categoriaId]
  });
}