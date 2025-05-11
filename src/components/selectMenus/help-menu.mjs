import { EmbedBuilder } from 'discord.js';

export const customId = 'help-menu';

export async function execute(interaction) {
  const category = interaction.values[0];
  const commands = interaction.client.commands.filter(cmd => {
    const cmdCategory = cmd.data.name.split('/')[0] || 'Geral';
    return cmdCategory === category;
  });

  const embed = new EmbedBuilder()
    .setColor(0x2F3136)
    .setTitle(`📑 Comandos da categoria ${category}`)
    .setDescription(commands.map(cmd => `**/${cmd.data.name}**\n${cmd.data.description}`).join('\n\n'))
    .setTimestamp()
    .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });

  await interaction.update({
    embeds: [embed],
    components: interaction.message.components
  });
}