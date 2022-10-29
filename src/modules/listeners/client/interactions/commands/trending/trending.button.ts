import { ButtonInteraction, MessageButton } from "discord.js";
import { Trending, TrendingData } from "lib/commands/trending/trendingData";
import { arrowLeft, arrowRight } from "assets/emoji";

import { ButtonRow } from "lib/discordComponents/button";
import { catchNewError } from "lib/errors/errorHandling";
import { Listener } from "@sapphire/framework";
import NodeCache from "node-cache";
import { setComponent } from "lib/discordComponents/component";

const trendingCache = new NodeCache({ stdTTL: 18000 });
const trendingData = new Trending(3);

export default class extends Listener {
   public async run(interaction: ButtonInteraction, arr: ButtonTuple) {
      try {
         const obj = extractButtonId(arr);

         if (interaction.user.id !== obj.authorId) {
            return interaction.reply({
               content: "This interaction is not for you..",
               ephemeral: true,
            });
         }

         const embedData = await getTrendingEmbedData(obj.page);
         const buttonRow = trendingButtonRow(obj.page, obj.authorId, embedData.hasNext);

         interaction.update({
            embeds: embedData.embeds,
            components: setComponent(buttonRow),
         });
      } catch (error: any) {
         interaction.deferUpdate();
         catchNewError(error);
      }
   }
}

export async function getTrendingEmbedData(page: number) {
   if (trendingCache.has(page)) {
      const cacheData = trendingCache.get<TrendingData>(page);
      if (!cacheData) throw new Error("variable is missing after check");
      const embedData = trendingData.getEmbedData(cacheData, page);

      setCacheData(page + 1);

      return embedData;
   } else {
      const data = await trendingData.getTrendingData(page);
      trendingCache.set<TrendingData>(page, data);
      const embedData = trendingData.getEmbedData(data, page);

      setCacheData(page + 1);

      return embedData;
   }
}

export function trendingButtonRow(page: number, authorId: string, hasNext: boolean) {
   const buttonRow = new ButtonRow([
      backPageButton({ page: page - 1, authorId }),
      nextPageButton({ page: page + 1, authorId }),
   ]);

   if (page <= 1) buttonRow.hideButton([0]);
   if (!hasNext) buttonRow.hideButton([1]);

   return buttonRow;
}

export interface TrendingPageOptions {
   page: number;
}

function setCacheData(page: number) {
   trendingData.getTrendingData(page).then((value) => {
      trendingCache.set<TrendingData>(page, value);
   });
}

function nextPageButton(buttonData: ButtonData) {
   const customIdValues: ButtonTuple = [
      "trending.button",
      buttonData.authorId,
      buttonData.page,
   ];

   const button = new MessageButton()
      .setCustomId(JSON.stringify(customIdValues))
      .setLabel("Next")
      .setEmoji(arrowRight.id)
      .setStyle("PRIMARY");

   return button;
}

function backPageButton(buttonData: ButtonData) {
   const customIdValues: ButtonTuple = [
      "trending.button",
      buttonData.authorId,
      buttonData.page,
   ];

   const button = new MessageButton()
      .setCustomId(JSON.stringify(customIdValues))
      .setLabel("Back")
      .setEmoji(arrowLeft.id)
      .setStyle("PRIMARY");

   return button;
}

interface ButtonData {
   page: number;
   authorId: string;
}

interface ButtonInterface extends ButtonData {
   customId: string;
}

export type ButtonTuple = [customId: string, authorId: string, page: number];

function extractButtonId(arr: ButtonTuple) {
   const obj: ButtonInterface = {
      customId: arr[0],
      authorId: arr[1],
      page: arr[2],
   };

   return obj;
}
