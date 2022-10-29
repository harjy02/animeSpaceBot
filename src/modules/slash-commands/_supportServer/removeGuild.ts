import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import {
   ApplicationCommandOptionChoiceData,
   AutocompleteInteraction,
   CommandInteraction,
} from "discord.js";
import fuzzysort from "fuzzysort";
import { guildListPrepared } from "global/dbCache";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description: `Testing`,
   },
   preconditions: ["OwnerOnly"],
   guildCommand: true,
   arguments: [
      {
         name: "guild",
         description: "The guild id",
         type: "STRING",
         autocomplete: true,
         required: true,
      },
   ],
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      const guildId = interaction.options.getString("guild", true);

      const guild = await this.container.client.guilds.fetch(guildId);
      await guild.leave();

      interaction.reply(`left guild: ${guild.name}`);
   }
   public async autocomplete(interaction: AutocompleteInteraction) {
      try {
         const inputString = interaction.options.getFocused(true).value as string;

         const applicationChoice: ApplicationCommandOptionChoiceData[] = [];

         const result = fuzzysort.go(inputString, guildListPrepared, {
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
