export const name = 'interactionCreate';
export const once = false;

export async function execute(interaction) {
  try {
    if (!interaction.isRepliable()) return;

    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      const cooldowns = interaction.client.cooldowns;
      if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Map());
      }

      const now = Date.now();
      const timestamps = cooldowns.get(command.data.name);
      const cooldownAmount = (command.cooldown ?? 3) * 1000;

      if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          if (!interaction.deferred && !interaction.replied) {
            await interaction.reply({
              content: `Aguarde ${timeLeft.toFixed(1)} segundos antes de usar o comando '${command.data.name}' novamente.`,
              flags: 64
            });
          }
          return;
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      if (!interaction.deferred && !interaction.replied) {
        await command.execute(interaction);
      }
    } else if (interaction.isButton()) {
      const button = interaction.client.buttons.get(interaction.customId);
      if (!button) return;
      if (!interaction.deferred && !interaction.replied) {
        await button.execute(interaction);
      }
    } else if (interaction.isStringSelectMenu()) {
      const menu = interaction.client.selectMenus.get(interaction.customId);
      if (!menu) return;
      if (!interaction.deferred && !interaction.replied) {
        await menu.execute(interaction);
      }
    } else if (interaction.isModalSubmit()) {
      const modal = interaction.client.modals.get(interaction.customId);
      if (!modal) return;
      if (!interaction.deferred && !interaction.replied) {
        await modal.execute(interaction);
      }
    }
  } catch (error) {
    console.error('Erro na interação:', error);
    const errorMessage = 'Ocorreu um erro ao executar esta interação.';
    try {
      if (interaction.deferred) {
        await interaction.editReply({ content: errorMessage, flags: 64 });
      } else if (interaction.replied) {
        await interaction.followUp({ content: errorMessage, flags: 64 });
      } else {
        await interaction.reply({ content: errorMessage, flags: 64 });
      }
    } catch (e) {
      console.error('Erro ao enviar mensagem de erro:', e);
    }
  }
}