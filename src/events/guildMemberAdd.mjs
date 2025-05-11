import { EmbedBuilder } from 'discord.js';

export const name = 'guildMemberAdd';
export const once = false;

export async function execute(member) {
  const welcomeChannelId = member.client.config.get('welcomeChannel');
  const memberRoleId = member.client.config.get('memberRole');

  if (welcomeChannelId) {
    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
    if (welcomeChannel) {
      const embed = new EmbedBuilder()
        .setColor(0x2F3136)
        .setTitle('👋 Bem-vindo(a)!')
        .setDescription(`${member} acabou de entrar no servidor!\n\n🎮 **Servidor:** ${member.guild.name}\n👥 **Membro:** #${member.guild.memberCount}\n\nLeia as regras e divirta-se!`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setTimestamp();

      await welcomeChannel.send({ content: `${member}`, embeds: [embed] });
    }
  }

  if (memberRoleId) {
    const role = member.guild.roles.cache.get(memberRoleId);
    if (role) {
      await member.roles.add(role).catch(() => {});
    }
  }

  try {
    const dmEmbed = new EmbedBuilder()
      .setColor(0x2F3136)
      .setTitle(`🎉 Bem-vindo(a) ao ${member.guild.name}!`)
      .setDescription('Obrigado por se juntar ao nosso servidor! Aqui estão algumas informações importantes:')
      .addFields(
        { name: '📜 Regras', value: 'Leia nossas regras para uma boa convivência' },
        { name: '🎫 Suporte', value: 'Use `/ticket` para abrir um ticket de suporte' },
        { name: '🎮 Minecraft', value: 'Use `/status` para ver o status do servidor' }
      )
      .setTimestamp();

    await member.send({ embeds: [dmEmbed] });
  } catch {}
}