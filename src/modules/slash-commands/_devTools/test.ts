import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { envEnviroment } from "assets/config";
import { CommandInteraction, MessageAttachment } from "discord.js";
import { setComponent } from "lib/discordComponents/component";
import { ButtonRow } from "lib/discordComponents/button";
import { airingListButton } from "modules/listeners/client/interactions/commands/airing/airingList.button";
import { airingWatchedButton } from "modules/listeners/client/interactions/commands/airing/airing.episodeStatus.button";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description: `Testing command`,
   },
   requiredClientPermissions: ["SEND_MESSAGES"],
   preconditions: ["OwnerOnly"],
   enabled: envEnviroment === "development" ? true : false,
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      const row = new ButtonRow([airingWatchedButton(21, 1036, "CURRENT")]);

      await interaction.reply({
         content: "test kebab",
         components: setComponent(row),
      });
   }
}
