import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { CommandInteraction } from "discord.js";
import { reloadChangelog } from "lib/commands/help/helpChangelogList";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description: `Testing`,
   },
   preconditions: ["OwnerOnly"],
   guildCommand: true,
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      await reloadChangelog();

      interaction.reply("Changelog reloaded!");
   }
}
