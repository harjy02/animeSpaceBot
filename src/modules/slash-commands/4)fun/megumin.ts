import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import type { CommandInteraction } from "discord.js";

import { ButtonRow } from "lib/discordComponents/button";
import { meguminButton } from "modules/listeners/client/interactions/commands/megumin/megumin.button";
import { setComponent } from "lib/discordComponents/component";
import { getMeguminEmbed } from "lib/commands/animePic/meguminCollector";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description: "Searches a random megumin image",
      usage: "just run /megumin",
   },
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      //#region [args]

      const authorId = interaction.user.id;

      //#endregion

      if (this.meguminNsfwCheck(interaction)) {
         return interaction.reply({
            content:
               "This command is not 100% guaranteed to display sfw content, so to prevent problems it is available only in channels enabled to view nsfw content or in DM",
            ephemeral: true,
         });
      }

      const embed = await getMeguminEmbed();

      const buttonRow = new ButtonRow([meguminButton(authorId)]);

      interaction.reply({
         embeds: [embed],
         components: setComponent(buttonRow),
      });
   }

   private meguminNsfwCheck(interaction: CommandInteraction) {
      if (
         interaction.channel &&
         (interaction.channel.type === "GUILD_NEWS" ||
            interaction.channel.type === "GUILD_TEXT")
      ) {
         if (interaction.channel.nsfw) return false;
         else return true;
      } else {
         return false;
      }
   }
}
