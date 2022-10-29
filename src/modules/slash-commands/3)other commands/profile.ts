import type {
   ApplicationCommandOptionChoiceData,
   AutocompleteInteraction,
   CommandInteraction,
} from "discord.js";

import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { generateProfile } from "lib/commands/profile/profileData";
import { getUserIndex } from "lib/commands/media/mediaIndex/userIndex";
import { parseJson } from "lib/tools/text/parseJson";
import { textTruncate } from "lib/tools/text/textTruncate";
import { unConnected } from "lib/templates/unConnected";
import { getUserData } from "cluster/anilist/libs/userData";
import { dmGuild } from "assets/reference";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description:
         "With this command you will be able to get a nice illustration of your :anilist: profile",
      requirements:
         "This command requires to be connected to an :anilist: profile (by using `/connect`)",
      usage: [
         "To use this command you can run it without any argument and you will get **your** illustration-board.",
         "You can also run the command using as argument an :anilist: username or id and you will get their illustration-board",
         "You can also run the command by using as argument an other discord user tag or id and if they are connected to someone it will show their illustration-board",
      ],
      example: [
         "`/profile` -> You get your profile info",
         "`/profile @kyros` -> You get the discord user named kyros profile",
         "`/profile kyros` -> you check the :anilist: user named kyros profile",
      ],
   },
   arguments: [
      {
         name: "anilist_username",
         description: "The name of the anilist user you wanna get the profile",
         type: "STRING",
         autocomplete: true,
         required: false,
      },
   ],
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      //#region [args]

      const guild = interaction.channel?.type === "DM" ? await dmGuild : interaction.guild;

      //#endregion

      if (!guild)
         return interaction.reply("command can only be executed in a guild or in DM");

      const responseObj = parseJson<UserTitleValue>(
         interaction.options.getString("anilist_username")!,
      );

      if (responseObj) {
         //#region [args]

         const userId = responseObj[0];

         //#endregion

         const embed = await generateProfile(userId);
         interaction.reply({ embeds: [embed] });
      } else {
         //#region [args]

         const authorId = interaction.user.id;

         //#endregion

         const userData = await getUserData(guild.id, authorId);
         if (!userData) return unConnected(interaction, { ephemeral: true });

         const embed = await generateProfile(userData);
         interaction.reply({ embeds: [embed] });
      }
   }

   public async autocomplete(interaction: AutocompleteInteraction) {
      try {
         const applicationChoice: ApplicationCommandOptionChoiceData[] = [];

         const userIndex = await getUserIndex(
            interaction.options.getFocused(true).value as string,
            8,
         );

         if (userIndex) {
            userIndex.forEach((value) => {
               const appValue: UserTitleValue = [value.id];

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

type UserTitleValue = [id: number];
