import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { CommandInteraction } from "discord.js";
import { testingMode, testingModeState } from "assets/config";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description: `Testing`,
   },
   preconditions: ["OwnerOnly"],
   guildCommand: true,
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      if (testingMode) testingModeState(false);
      else testingModeState(true);

      interaction.reply(`Testing mode state changed to: ${testingMode}`);
   }
}
