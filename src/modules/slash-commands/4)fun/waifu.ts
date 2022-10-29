import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import type { CommandInteraction } from "discord.js";
import { getWaifuEmbed } from "lib/commands/animePic/waifuCollection";
import { ButtonRow } from "lib/discordComponents/button";
import { waifuButton } from "modules/listeners/client/interactions/commands/waifu/waifu.button";
import { setComponent } from "lib/discordComponents/component";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description: "Searches a random waifu image",
      usage: "just run /waifu",
   },
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      //#region [args]

      const authorId = interaction.user.id;

      //#endregion

      if (this.waifuNsfwCheck(interaction)) {
         return interaction.reply({
            content:
               "This command is not 100% guaranteed to display sfw content, so to prevent problems it is available only in channels enabled to view nsfw content or in DM",
            ephemeral: true,
         });
      }

      const embed = await getWaifuEmbed("sfw");

      const buttonRow = new ButtonRow([
         waifuButton({ type: "sfw", authorId }),
         waifuButton({ type: "nsfw", authorId }),
      ]);

      interaction.reply({
         embeds: [embed],
         components: setComponent(buttonRow),
      });
   }

   private waifuNsfwCheck(interaction: CommandInteraction) {
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
