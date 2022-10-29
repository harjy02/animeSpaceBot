import {
   getSeasonalEmbedData,
   seasonalButtonRow,
} from "modules/listeners/client/interactions/commands/seasonal/seasonal.button";

import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { CommandInteraction } from "discord.js";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { setComponent } from "lib/discordComponents/component";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description: "This commands will show the current seasonal anime",
      usage: "To use the command just run `/seasonal` without any argument and then use the buttons to navigate the different pages",
   },
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      //#region [args]

      const authorId = interaction.user.id;

      //#endregion

      const seasonalData = await getSeasonalEmbedData(1);

      const buttonRow = seasonalButtonRow(1, authorId, seasonalData.hasNext);

      interaction.reply({
         embeds: seasonalData.embeds,
         components: setComponent(buttonRow),
      });
   }
}
