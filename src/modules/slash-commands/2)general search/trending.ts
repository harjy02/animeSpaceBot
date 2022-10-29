import {
   getTrendingEmbedData,
   trendingButtonRow,
} from "modules/listeners/client/interactions/commands/trending/trending.button";

import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { CommandInteraction } from "discord.js";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { setComponent } from "lib/discordComponents/component";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description:
         "Similar to the command `/seasonal` this command will show the currently trending anime",
      usage: "To use this command just run `/trending` without any argument and then iterate through the pages",
   },
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      //#region [args]

      const authorId = interaction.user.id;

      //#endregion

      const trendingData = await getTrendingEmbedData(1);

      const buttonRow = trendingButtonRow(1, authorId, trendingData.hasNext);

      interaction.reply({
         embeds: trendingData.embeds,
         components: setComponent(buttonRow),
      });
   }
}
