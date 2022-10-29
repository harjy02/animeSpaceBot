import type {
   ApplicationCommandOptionChoiceData,
   AutocompleteInteraction,
   CommandInteraction,
} from "discord.js";

import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { getStaffIndex } from "lib/commands/media/mediaIndex/staffIndex";
import { parseJson } from "lib/tools/text/parseJson";
import { staffOverview } from "lib/commands/media/mediaSearch/commands/staffMedia/staffOverview";
import { textTruncate } from "lib/tools/text/textTruncate";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description:
         "This command allows you to search information about any staff member in the anime industry",
      usage: "To use this command just run `/staff` by using as argument the name of the staff member you want to search",
      structure: `/staff <staff name>`,
      example: `/staff Hiroshi Kamiya`,
   },
   arguments: [
      {
         name: "staff_name",
         description: "Name of the staff to search for",
         type: "STRING",
         autocomplete: true,
         required: true,
      },
   ],
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      const responseObj = parseJson<StaffTitleValue>(
         interaction.options.getString("staff_name")!,
      );

      if (responseObj) {
         //#region [args]

         const id = responseObj[0];

         //#endregion

         const staffData = await staffOverview(id);
         if (!staffData) throw new Error("Staff not found from id");

         return interaction.reply({
            embeds: [staffData],
         });
      } else {
         return interaction.reply(
            "You need to select an element from the list of names that appears while typing the staff name",
         );
      }
   }

   public async autocomplete(interaction: AutocompleteInteraction) {
      try {
         const applicationChoice: ApplicationCommandOptionChoiceData[] = [];

         const staffIndex = await getStaffIndex(
            interaction.options.getFocused(true).value as string,
            8,
         );

         if (staffIndex) {
            staffIndex.forEach((value) => {
               const appValue: StaffTitleValue = [value.id];

               applicationChoice.push({
                  name: textTruncate(value.name.full, 50),
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

type StaffTitleValue = [id: number];
