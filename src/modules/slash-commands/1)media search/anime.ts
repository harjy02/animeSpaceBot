import type {
   ApplicationCommandOptionChoiceData,
   AutocompleteInteraction,
   CommandInteraction,
} from "discord.js";

import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { animeMenu } from "modules/listeners/client/interactions/commands/anime/anime.selectMenu";
import { animeOverview } from "lib/commands/media/mediaSearch/media/animeMedia/animeOverview";
import { getMediaIndex } from "lib/commands/media/mediaIndex/mediaIndex";
import { parseJson } from "lib/tools/text/parseJson";
import { setComponent } from "lib/discordComponents/component";
import { textTruncate } from "lib/tools/text/textTruncate";
import { findOrCreateDiscordGuild } from "cluster/anilist/libs/discordGuild";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description: "This command allows you to search general info about any anime",
      usage: "To use this command run `/anime` by using as argument the title of the anime you want to search",
      structure: "/anime <anime title>",
      example: "`/anime one piece` or `/anime kekkai sensen` etc..",
   },
   arguments: [
      {
         name: "title",
         description: "the title of the anime you want to search",
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

      const responseObj = parseJson<AnimeTitleValue>(
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
                  "This anime is hentai, use the command in a channel enabled to view nsfw content to see it",
               ephemeral: true,
            });
         }

         const mediaOverview = await animeOverview(guild.id, authorId, idAl, idMal);
         const selectMenu = animeMenu(authorId, idAl, idMal);

         interaction.reply({
            embeds: [mediaOverview.embed],
            components: setComponent(selectMenu),
         });
      } else {
         //#region [args]

         const animeTitle = interaction.options.getString("title")!;
         const filteredSearch = animeTitle.replace(/〈(.*?)〉/g, "");

         const authorId = interaction.user.id;

         const channelNsfwCheck = this.nsfwCheck(interaction.channel!);

         //#endregion

         const tvMediaIndex = await getMediaIndex(filteredSearch, 1, "ANIME", "TV");
         if (!tvMediaIndex) {
            const defMediaIndex = await getMediaIndex(filteredSearch, 1, "ANIME");
            if (!defMediaIndex) return interaction.reply("Anime not found");

            const media = defMediaIndex[0];
            if (media.isAdult && channelNsfwCheck) {
               return interaction.reply({
                  content:
                     "This anime is hentai, use the command in a channel enabled to view nsfw content to see it",
                  ephemeral: true,
               });
            }

            const mediaData = await animeOverview(
               guild.id,
               authorId,
               media.idAl,
               media.idMal,
            );
            const selectMenu = animeMenu(authorId, media.idAl, media.idMal);

            return interaction.reply({
               embeds: [mediaData.embed],
               components: setComponent(selectMenu),
            });
         }

         const media = tvMediaIndex[0];
         if (media.isAdult && channelNsfwCheck) {
            return interaction.reply({
               content:
                  "This anime is hentai, use the command in a channel enabled to view nsfw content to see it",
               ephemeral: true,
            });
         }

         const mediaData = await animeOverview(
            guild.id,
            authorId,
            media.idAl,
            media.idMal,
         );
         const selectMenu = animeMenu(authorId, media.idAl, media.idMal);

         interaction.reply({
            embeds: [mediaData.embed],
            components: setComponent(selectMenu),
         });
      }
   }

   public async autocomplete(interaction: AutocompleteInteraction) {
      try {
         const title = interaction.options.getFocused(true).value as string;

         const titleSplit = title.toLowerCase().split(" ").pop();

         const applicationChoice: ApplicationCommandOptionChoiceData[] = [];

         const openParenthesis = "〈";
         const closedParenthesis = "〉";

         switch (titleSplit) {
            case "ona": {
               const mediaIndex = await getMediaIndex(title, 1, "ANIME", "ONA");

               if (mediaIndex) {
                  mediaIndex.forEach((value) => {
                     const appValue: AnimeTitleValue = [
                        value.idAl,
                        value.idMal,
                        value.isAdult,
                     ];

                     applicationChoice.push({
                        name: `${textTruncate(value.title, 50)} ${openParenthesis}${
                           value.format
                        }${closedParenthesis}`,
                        value: JSON.stringify(appValue),
                     });
                  });
               }

               return interaction.respond(applicationChoice);
            }
            case "ova": {
               const mediaIndex = await getMediaIndex(title, 1, "ANIME", "OVA");

               if (mediaIndex) {
                  mediaIndex.forEach((value) => {
                     const appValue: AnimeTitleValue = [
                        value.idAl,
                        value.idMal,
                        value.isAdult,
                     ];

                     applicationChoice.push({
                        name: `${textTruncate(value.title, 50)} ${openParenthesis}${
                           value.format
                        }${closedParenthesis}`,
                        value: JSON.stringify(appValue),
                     });
                  });
               }

               return interaction.respond(applicationChoice);
            }
            case "special": {
               const mediaIndex = await getMediaIndex(title, 1, "ANIME", "SPECIAL");

               if (mediaIndex) {
                  mediaIndex.forEach((value) => {
                     const appValue: AnimeTitleValue = [
                        value.idAl,
                        value.idMal,
                        value.isAdult,
                     ];

                     applicationChoice.push({
                        name: `${textTruncate(value.title, 50)} ${openParenthesis}${
                           value.format
                        }${closedParenthesis}`,
                        value: JSON.stringify(appValue),
                     });
                  });
               }

               return interaction.respond(applicationChoice);
            }
         }

         const mediaIndexGeneric = await getMediaIndex(title, 8, "ANIME");

         if (mediaIndexGeneric) {
            mediaIndexGeneric.forEach((value) => {
               const appValue: AnimeTitleValue = [value.idAl, value.idMal, value.isAdult];

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

type AnimeTitleValue = [idAl: number, idMal: number, isAdult: boolean];
