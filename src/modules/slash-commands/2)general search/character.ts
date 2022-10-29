import type {
   ApplicationCommandOptionChoiceData,
   AutocompleteInteraction,
   CommandInteraction,
} from "discord.js";

import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { characterMenu } from "modules/listeners/client/interactions/commands/character/character.selectMenu";
import { characterOverview } from "lib/commands/media/mediaSearch/commands/characterMedia/characterOverview";
import { getCharacterIndex } from "lib/commands/media/mediaIndex/characterIndex";
import { parseJson } from "lib/tools/text/parseJson";
import { setComponent } from "lib/discordComponents/component";
import { textTruncate } from "lib/tools/text/textTruncate";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description: "This command allows you to search general info about any character",
      usage: "To use this command just run `/character` by using as argument the name of the character to search for",
      structure: "/character <name of the character>",
      example: "/character leonardo watch",
   },
   arguments: [
      {
         name: "name",
         description: "The name of the character to search info about",
         type: "STRING",
         autocomplete: true,
         required: true,
      },
   ],
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      const responseObj = parseJson<CharacterTitleValue>(
         interaction.options.getString("name")!,
      );

      if (responseObj) {
         //#region [args]

         const authorId = interaction.user.id;
         const id = responseObj[0];

         //#endregion

         const characterData = await characterOverview(responseObj[0]);
         if (!characterData) throw new Error("Character not found from id");

         return interaction.reply({
            embeds: [characterData.embed],
            components: setComponent(characterMenu(authorId, id)),
         });
      } else {
         return interaction.reply(
            "You need to select an element from the list of names that appears while typing the character name",
         );
      }
   }

   public async autocomplete(interaction: AutocompleteInteraction) {
      try {
         const applicationChoice: ApplicationCommandOptionChoiceData[] = [];

         const characterIndex = await getCharacterIndex(
            interaction.options.getFocused(true).value as string,
            8,
         );

         if (characterIndex) {
            characterIndex.forEach((value) => {
               const appValue: CharacterTitleValue = [value.id];

               applicationChoice.push({
                  name:
                     textTruncate(value.name, 50) + ` (${textTruncate(value.title, 45)})`,
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

type CharacterTitleValue = [id: number];
