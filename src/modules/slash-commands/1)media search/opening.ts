import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import {
   ApplicationCommandOptionChoiceData,
   AutocompleteInteraction,
   CommandInteraction,
   Message,
   MessageButton,
} from "discord.js";
import { getMediaIndex } from "lib/commands/media/mediaIndex/mediaIndex";
import { textTruncate } from "lib/tools/text/textTruncate";
import { disableComponent, setComponent } from "lib/discordComponents/component";
import { parseJson } from "lib/tools/text/parseJson";
import { arrowRight, arrowLeft, list, block } from "assets/emoji";
import { AnimeOpeningCollection } from "lib/commands/media/Themes/animeOpeningCollection";
import { ButtonRow } from "lib/discordComponents/button";
import { catchNewError } from "lib/errors/errorHandling";
import { findOrCreateDiscordGuild } from "cluster/anilist/libs/discordGuild";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description:
         "This command allows you to search an anime and view all it's openings",
      usage: "To use this command run `/opening` by using as argument the title of the anime you want to search",
      structure: "/opening <anime title>",
      example: "`/opening one piece` or `/opening kekkai sensen` etc..",
   },
   arguments: [
      {
         name: "title",
         description: "the title of the anime you want to get openings for",
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
         // const idAl = responseObj[0];
         const idMal = responseObj[1];
         const isAdult = responseObj[2];

         const channelNsfwCheck = this.nsfwCheck(interaction.channel!);

         //#endregion

         if (isAdult && channelNsfwCheck) {
            return interaction.reply({
               content:
                  "This anime is hentai, use the command in a channel enabled to view nsfw content to see openings of it",
               ephemeral: true,
            });
         }

         return this.opening(idMal, authorId, interaction);
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

            return this.opening(media.idMal, authorId, interaction);
         }

         const media = tvMediaIndex[0];
         if (media.isAdult && channelNsfwCheck) {
            return interaction.reply({
               content:
                  "This anime is hentai, use the command in a channel enabled to view nsfw content to see it",
               ephemeral: true,
            });
         }

         return this.opening(media.idMal, authorId, interaction);
      }
   }

   private async opening(
      idMal: number,
      authorId: string,
      interaction: CommandInteraction,
   ) {
      const openingCollection = new AnimeOpeningCollection(idMal);
      const startingPage = await openingCollection.getOpening(1);

      const nullContent = startingPage.nullContent;

      let currentPage = 1;
      let hasNext = startingPage.hasNext;
      //let currentView: "list" | "view" = "list";

      const pageRow = new ButtonRow([listButton, backPageButton, nextPageButton]);

      pageRow.hideButton([1]);
      if (!hasNext) pageRow.hideButton([2]);

      const sent = (await interaction.reply({
         content: startingPage.description,
         components: setComponent(pageRow),
         fetchReply: true,
         ephemeral: nullContent ? true : false,
      })) as Message;

      const collector = sent.createMessageComponentCollector({
         idle: 300000,
      });

      collector.on("collect", async (collectInteraction) => {
         if (collectInteraction.user.id !== authorId) {
            return collectInteraction.reply({
               content: "This interaction is not for you..",
               ephemeral: true,
            });
         }

         switch (collectInteraction.componentType) {
            case "BUTTON": {
               switch (collectInteraction.customId) {
                  case "list": {
                     const openingList = await openingCollection.getOpeningList();

                     const pageRow2 = new ButtonRow([blockButton]);

                     return collectInteraction.update({
                        content: null,
                        embeds: [openingList],
                        components: setComponent(pageRow2),
                     });
                  }
                  case "block": {
                     return collectInteraction.update({
                        content: startingPage.description,
                        embeds: [],
                        components: setComponent(pageRow),
                     });
                  }
                  case "nextPage": {
                     currentPage++;

                     const currentList = await openingCollection.getOpening(currentPage);

                     //__<variables>
                     hasNext = currentList.hasNext;
                     if (currentPage > 1) pageRow.showButton([1]);
                     if (!hasNext) pageRow.hideButton([2]);
                     //__</variables>

                     return collectInteraction.update({
                        content: currentList.description,
                        components: setComponent(pageRow),
                     });
                  }
                  case "backPage": {
                     currentPage--;

                     const currentList = await openingCollection.getOpening(currentPage);

                     //__<variables>
                     hasNext = currentList.hasNext;
                     if (currentPage === 1) pageRow.hideButton([1]);
                     if (hasNext) pageRow.showButton([2]);
                     //__</variables>

                     return collectInteraction.update({
                        content: currentList.description,
                        components: setComponent(pageRow),
                     });
                  }
               }
               break;
            }
         }
      });
      collector.on("end", (_listener, reason) => {
         switch (reason) {
            case "idle": {
               sent.edit({ components: disableComponent(pageRow) });
               break;
            }
            default: {
               throw catchNewError(reason);
            }
         }
      });
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

const nextPageButton = new MessageButton()
   .setCustomId("nextPage")
   .setLabel("Next")
   .setEmoji(arrowRight.id)
   .setStyle("PRIMARY");

const backPageButton = new MessageButton()
   .setCustomId("backPage")
   .setLabel("Back")
   .setEmoji(arrowLeft.id)
   .setStyle("PRIMARY");

const listButton = new MessageButton()
   .setCustomId("list")
   .setEmoji(list.id)
   .setStyle("SUCCESS");

const blockButton = new MessageButton()
   .setCustomId("block")
   .setEmoji(block.id)
   .setStyle("SUCCESS");
