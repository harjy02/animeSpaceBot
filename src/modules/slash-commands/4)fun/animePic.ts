import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import type {
   ApplicationCommandOptionChoiceData,
   AutocompleteInteraction,
   CommandInteraction,
} from "discord.js";

import {
   generateSafebooruImageEmbed,
   getSafebooruTagAutocomplete,
} from "lib/commands/animePic/safebooruWrapper";
import { setComponent } from "lib/discordComponents/component";
import { animePicButton } from "modules/listeners/client/interactions/commands/animePic/animepic.button";
import { ButtonRow } from "lib/discordComponents/button";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description: "Get a random anime related pic from a series of categories",
   },
   arguments: [
      {
         name: "first_tag",
         description: "The tag that images should have",
         type: "STRING",
         autocomplete: true,
         required: true,
      },
      {
         name: "second_tag",
         description: "The second tag to match image choice",
         type: "STRING",
         autocomplete: true,
         required: false,
      },
   ],
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      const responseTag1 = interaction.options.getString("first_tag")!;
      const responseTag2 = interaction.options.getString("second_tag");

      const tagList: string[] = [];

      const manualInput = (n: "first" | "second") => {
         interaction.reply({
            content: `The ${n} tag was inputted manually, select elements from the autocomplete list, if you don't get what you are searching for in that list than that tag doesn't exist`,
            ephemeral: true,
         });
      };

      if (responseTag1.startsWith("[") && responseTag1.endsWith("]"))
         tagList.push(responseTag1.slice(1, responseTag1.length - 1));
      else return manualInput("first");

      if (responseTag2) {
         if (responseTag2.startsWith("[") && responseTag2.endsWith("]"))
            tagList.push(responseTag2.slice(1, responseTag2.length - 1));
         else return manualInput("second");
      }

      //#region [args]

      const tag = tagList.join("+");
      const authorId = interaction.user.id;

      //#endregion

      const embed = await generateSafebooruImageEmbed(tag);
      if (!embed) {
         return interaction.reply({
            content:
               "There isn't any image for this tag as the search is limited to sfw(safe for work) content",
            ephemeral: true,
         });
      }

      const buttonRow = new ButtonRow([animePicButton({ tag, authorId })]);

      interaction.reply({
         embeds: [embed],
         components: setComponent(buttonRow),
      });
   }

   public async autocomplete(interaction: AutocompleteInteraction) {
      const option: ApplicationCommandOptionChoiceData[] = [];

      const search = interaction.options.getFocused(true).value as string;

      option.push(...(await getSafebooruTagAutocomplete(search)));

      interaction.respond(option);
   }
}

// type TagValue = [tag: string];
