import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import {
   ApplicationCommandOptionChoiceData,
   AutocompleteInteraction,
   CommandInteraction,
} from "discord.js";
import { REST } from "@discordjs/rest";
import { envDiscordToken } from "assets/config";
import { Routes } from "discord-api-types/v10";
import fuzzysort from "fuzzysort";
import { guildList, guildListPrepared } from "global/dbCache";
import { container } from "@sapphire/pieces";

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
         required: false,
      },
   ],
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      const guildId = interaction.options.getString("guild", false);

      if (guildId) {
         const fetchedGuild = await this.container.client.guilds.fetch(guildId);

         await guildUnregister(guildId);

         await interaction.reply(
            `Unregistered guild-command from guild ${fetchedGuild.name}`,
         );
      } else {
         for (const each of guildList) await guildUnregister(each);

         await interaction.reply(`Unregistered guild-command from all guilds`);
      }
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

async function guildUnregister(guildId: string) {
   const rest = new REST({ version: "9" }).setToken(envDiscordToken);

   await rest.put(Routes.applicationGuildCommands(container.client.id!, guildId), {
      body: [],
   });
}
