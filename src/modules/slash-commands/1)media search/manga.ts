import type {
   ApplicationCommandOptionChoiceData,
   AutocompleteInteraction,
   CommandInteraction,
} from "discord.js";

import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { getMediaIndex } from "lib/commands/media/mediaIndex/mediaIndex";
import { mangaMenu } from "modules/listeners/client/interactions/commands/manga/manga.selectMenu";
import { mangaOverview } from "lib/commands/media/mediaSearch/media/mangaMedia/mangaOverview";
import { parseJson } from "lib/tools/text/parseJson";
import { setComponent } from "lib/discordComponents/component";
import { textTruncate } from "lib/tools/text/textTruncate";
import { findOrCreateDiscordGuild } from "cluster/anilist/libs/discordGuild";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description: "This command allows you to search general info about any manga",
      usage: "To use this command run `/manga` by using as argument the title of the manga you want to search",
      structure: "/manga <name of the manga>",
      example: "`/manga one piece` or `/manga kekkai sensen` etc..",
   },
   arguments: [
      {
         name: "title",
         description: "the title of the manga you want to search",
         type: "STRING",
         autocomplete: true,
         required: true,
      },
   ],
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      //#region [args]

      const guild =
         interaction.channel?.type === "DM"
            ? await findOrCreateDiscordGuild({ id: "0", name: "DM" })
            : interaction.guild;

      //#endregion

      if (!guild) return interaction.reply("command only executable in a guild or in dm");

      const responseObj = parseJson<MangaTitleValue>(
         interaction.options.getString("title")!,
      );

      if (responseObj) {
         //#region [args]

         const authorId = interaction.user.id;
         const idAl = responseObj[0];
         const idMal = responseObj[1];
         const isAdult = responseObj[2];

         const channelNsfwCheck = this.nsfwCheck(interaction.channel!);

         //#endregion

         if (isAdult && channelNsfwCheck) {
            return interaction.reply({
               content:
                  "This manga is hentai, use the command in a channel enabled to view nsfw content to see it",
               ephemeral: true,
            });
         }

         const mediaOverview = await mangaOverview(guild.id, authorId, idAl, idMal);
         const selectMenu = mangaMenu(authorId, idAl, idMal);

         interaction.reply({
            embeds: [mediaOverview.embed],
            components: setComponent(selectMenu),
         });
      } else {
         //#region [args]

         const mangaTitle = interaction.options.getString("title")!;
         const filteredSearch = mangaTitle.replace(/〈(.*?)〉/g, "");

         const authorId = interaction.user.id;

         const channelNsfwCheck = this.nsfwCheck(interaction.channel!);

         //#endregion

         const mediaIndex = await getMediaIndex(filteredSearch, 1, "MANGA");
         if (!mediaIndex) return interaction.reply("Manga not found");

         const media = mediaIndex[0];
         if (media.isAdult && channelNsfwCheck) {
            return interaction.reply({
               content:
                  "This manga is hentai, use the command in a channel enabled to view nsfw content to see it",
               ephemeral: true,
            });
         }

         const mediaData = await mangaOverview(
            guild.id,
            authorId,
            media.idAl,
            media.idMal,
         );
         const selectMenu = mangaMenu(authorId, media.idAl, media.idMal);

         interaction.reply({
            embeds: [mediaData.embed],
            components: setComponent(selectMenu),
         });
      }
   }

   public async autocomplete(interaction: AutocompleteInteraction) {
      try {
         const applicationChoice: ApplicationCommandOptionChoiceData[] = [];

         const openParenthesis = "〈";
         const closedParenthesis = "〉";

         const mediaIndex = await getMediaIndex(
            interaction.options.getFocused(true).value as string,
            8,
            "MANGA",
         );

         if (mediaIndex) {
            mediaIndex.forEach((value) => {
               const appValue: MangaTitleValue = [value.idAl, value.idMal, value.isAdult];

               applicationChoice.push({
                  name: `${textTruncate(value.title, 50)} ${openParenthesis}${
                     value.format
                  }${closedParenthesis}`,
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

type MangaTitleValue = [idAl: number, idMal: number, isAdult: boolean];
