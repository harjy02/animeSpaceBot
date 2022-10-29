import type {
   ApplicationCommandOptionChoiceData,
   AutocompleteInteraction,
   CommandInteraction,
} from "discord.js";

import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { commandList } from "global/dbCache";
import fuzzysort from "fuzzysort";
import { helpCommandInfo } from "lib/commands/help/helpCommandInfo";
import { helpHome } from "lib/commands/help/helpHome";
import { helpMainComponents } from "modules/listeners/client/interactions/commands/help/help.selectMenu";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description:
         "By using this command you will be able to se all the commands in the bot and their respective use",
      usage: [
         "Just run `/help` without any argument and it will show the command list",
         "While if you run `/help` by using as argument a command name it will show that command info",
      ],
      structure: [
         "`/help` -> it will show the full command list",
         "`/help <command name>` -> it will show information about the searched command",
      ],
   },
   arguments: [
      {
         name: "command_name",
         description: "The name of the command to search info about",
         type: "STRING",
         autocomplete: true,
         required: false,
      },
   ],
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      //#region [args]

      const selectedTitle = interaction.options.getString("command_name")!;
      const authorId = interaction.user.id;

      //#endregion

      if (selectedTitle) {
         return interaction.reply({
            embeds: [await helpCommandInfo(selectedTitle)],
         });
      }

      //__<components>

      const embed = await helpHome();

      //__</components>

      interaction.reply({
         embeds: [embed],
         components: helpMainComponents(authorId),
      });
   }

   public async autocomplete(interaction: AutocompleteInteraction) {
      try {
         const inputString = interaction.options.getFocused(true).value as string;

         const applicationChoice: ApplicationCommandOptionChoiceData[] = [];

         const result = fuzzysort.go(inputString, commandList, {
            limit: 10, // don't return more results than you need!
            threshold: -10000, // don't return bad results
         });

         result.forEach((value) => {
            applicationChoice.push({
               name: value.target,
               value: value.target,
            });
         });

         interaction.respond(applicationChoice);
      } catch (error: any) {
         this.catchAutocompleteError(error);
      }
   }
}
