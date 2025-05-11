import { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';

const ticketTypes = {
  'ticket-duvidas': { name: 'Dúvidas', emoji: '📝', color: 0x5865F2 },
  'ticket-suporte': { name: 'Suporte', emoji: '🛠️', color: 0x57F287 },
  'ticket-vip': { name: 'VIP', emoji: '💎', color: 0x9B59B6 }
};

export const customId = /^ticket-(?:duvidas|suporte|vip|fechar|trancar|destrancar)$/;

export async function execute(interaction) {
  const action = interaction.customId.split('-')[1];

  if (['duvidas', 'suporte', 'vip'].includes(action)) {
    await createTicket(interaction, action);
  } else if (action === 'fechar') {
    await closeTicket(interaction);
  } else if (action === 'trancar') {
    await lockTicket(interaction);
  } else if (action === 'destrancar') {
    await unlockTicket(interaction);
  }
}

async function createTicket(interaction, type) {
  const ticketType = ticketTypes[`ticket-${type}`];
  const categoryId = interaction.client.config.get('ticketCategory');
  const counter = (interaction.client.config.get('ticketCounter') || 0) + 1;
  interaction.client.config.set('ticketCounter', counter);

  const supportRole = interaction.guild.roles.cache.get(interaction.client.config.get('supportRole'));

  const channel = await interaction.guild.channels.create({
    name: `${type}-${counter}`,
    type: ChannelType.GuildText,
    parent: categoryId,
    permissionOverwrites: [
      {
        id: supportRole?.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages]
      },
      {
        id: interaction.guild.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: supportRole?.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages]
      },
      {
        id: interaction.user.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
      },
      {
        id: supportRole?.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages]
      },
      {
        id: interaction.client.user.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels]
      }
    ]
  });

  const embed = new EmbedBuilder()
    .setColor(ticketType.color)
    .setTitle(`${ticketType.emoji} Ticket de ${ticketType.name}`)
    .setDescription(`Olá ${interaction.user}, seu ticket foi criado!\nA equipe de suporte irá lhe atender em breve.\n\nPara fechar o ticket, clique no botão abaixo.`)
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('ticket-fechar')
        .setLabel('Fechar Ticket')
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('ticket-trancar')
        .setLabel('Trancar')
        .setEmoji('🔐')
        .setStyle(ButtonStyle.Secondary)
    );

  await channel.send({ embeds: [embed], components: [row] });
  await interaction.reply({ content: `Seu ticket foi criado: ${channel}`, ephemeral: true });

  const logChannel = interaction.guild.channels.cache.get(interaction.client.config.get('logChannel'));
  if (logChannel) {
    const logEmbed = new EmbedBuilder()
      .setColor(ticketType.color)
      .setTitle('📝 Ticket Criado')
      .setDescription(`**Ticket:** ${channel}\n**Tipo:** ${ticketType.name}\n**Usuário:** ${interaction.user}\n**ID:** ${interaction.user.id}`)
      .setTimestamp();

    await logChannel.send({ embeds: [logEmbed] });
  }
}

async function closeTicket(interaction) {
  const logChannel = interaction.guild.channels.cache.get(interaction.client.config.get('logChannel'));
  
  const logEmbed = new EmbedBuilder()
    .setColor(0xFF0000)
    .setTitle('🔒 Ticket Fechado')
    .setDescription(`**Ticket:** ${interaction.channel.name}\n**Fechado por:** ${interaction.user}\n**ID:** ${interaction.user.id}`)
    .setTimestamp();

  if (logChannel) {
    await logChannel.send({ embeds: [logEmbed] });
  }

  await interaction.reply('Este ticket será fechado em 5 segundos...');
  setTimeout(() => interaction.channel.delete(), 5000);
}

async function lockTicket(interaction) {
  await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
    SendMessages: false
  });

  const embed = new EmbedBuilder()
    .setColor(0xFFA500)
    .setDescription('🔐 Ticket trancado por ' + interaction.user.toString());

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('ticket-destrancar')
        .setLabel('Destrancar')
        .setEmoji('🔓')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('ticket-fechar')
        .setLabel('Fechar Ticket')
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Danger)
    );

  await interaction.reply({ embeds: [embed], components: [row] });
}

async function unlockTicket(interaction) {
  await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
    SendMessages: null
  });

  const embed = new EmbedBuilder()
    .setColor(0x00FF00)
    .setDescription('🔓 Ticket destrancado por ' + interaction.user.toString());

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('ticket-trancar')
        .setLabel('Trancar')
        .setEmoji('🔐')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('ticket-fechar')
        .setLabel('Fechar Ticket')
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Danger)
    );

  await interaction.reply({ embeds: [embed], components: [row] });
}