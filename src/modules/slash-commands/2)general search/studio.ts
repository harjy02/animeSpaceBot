import type {
   ApplicationCommandOptionChoiceData,
   AutocompleteInteraction,
   CommandInteraction,
} from "discord.js";

import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { getStudioIndex } from "lib/commands/media/mediaIndex/studioIndex";
import { parseJson } from "lib/tools/text/parseJson";
import { studioOverview } from "lib/commands/media/mediaSearch/commands/studioMedia/studioOverview";
import { textTruncate } from "lib/tools/text/textTruncate";

@ApplyOptions<SlashCommandOptions>({
   info: {
	   description: `This command allows you to look up information about any studio member in anime industry`,
	   usage: "To use this command just run `/studio` by using as argument the name of the studio to search for",
	   structure: `/studio <studio name>`,
	   example: `/studio mappa`,
	},
   arguments: [
      {
         name: "studio_name",
         description: "Name of the studio to search for",
         type: "STRING",
         autocomplete: true,
         required: true,
      },
   ],
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      const responseObj = parseJson<StudioTitleValue>(
         interaction.options.getString("studio_name")!,
      );

      if (responseObj) {
         //#region [args]

         const id = responseObj[0];

         //#endregion

         const studioData = await studioOverview(id);
         if (!studioData) throw new Error("Studio not found from id");

         return interaction.reply({
            embeds: [studioData],
         });
      } else {
         return interaction.reply(
            "You need to select an element from the list of names that appears while typing the studio name",
         );
      }
   }

   public async autocomplete(interaction: AutocompleteInteraction) {
      try {
         const applicationChoice: ApplicationCommandOptionChoiceData[] = [];

         const studioIndex = await getStudioIndex(
            interaction.options.getFocused(true).value as string,
            8,
         );

         if (studioIndex) {
            studioIndex.forEach((value) => {
               const appValue: StudioTitleValue = [value.id];

               applicationChoice.push({
                  name: textTruncate(value.name, 50),
                  value: JSON.stringify(appValue),
               });
            });
         }

         interaction.respond(applicationChoice);
      } catch (error: any) {
         this.catchAutocompleteError(error);
      }
   }
}

type StudioTitleValue = [id: number];
