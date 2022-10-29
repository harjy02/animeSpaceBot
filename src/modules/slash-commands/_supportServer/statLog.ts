import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { getCommandStatistics, getInteractionStatistics } from "assets/statLog";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description: `Testing`,
   },
   preconditions: ["OwnerOnly"],
   guildCommand: true,
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      const commandStats = getCommandStatistics().map(
         (value) => `${value.commandName}: ${value.count}`,
      );
      const interactionStats = getInteractionStatistics().map(
         (value) => `${value.InteractionName}: ${value.count}`,
      );

      const embed = new MessageEmbed().setDescription(
         [
            "Command usage statistics:",
            ...commandStats,
            "",
            "Interaction usage stats:",
            ...interactionStats,
         ].join("\n"),
      );

      interaction.reply({ embeds: [embed] });
   }
}
