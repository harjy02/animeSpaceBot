import { ButtonInteraction, MessageButton } from "discord.js";
import { Seasonal, SeasonalData } from "lib/commands/seasonal/seasonalData";
import { arrowLeft, arrowRight } from "assets/emoji";

import { ButtonRow } from "lib/discordComponents/button";
import { catchNewError } from "lib/errors/errorHandling";
import { Listener } from "@sapphire/framework";
import NodeCache from "node-cache";
import { setComponent } from "lib/discordComponents/component";
import { getSeasonalEmbedData } from "../seasonal/seasonal.button";
import { airingAddSeasonalButtonRow } from "./airingAddSeasonal.button";

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

         const embedData = await getSeasonalEmbedData(obj.page);
         const buttonRow = airingSeasonalButtonRow(obj.page, obj.authorId, embedData.hasNext);

         const animeList = embedData.animeList;

         const animeButtonList = animeList.map((element) =>
            airingAddSeasonalButtonRow(obj.authorId, element[0], element[1]),
         );

         interaction.update({
            embeds: embedData.embeds,
            components: setComponent(buttonRow, ...animeButtonList),
         });
      } catch (error: any) {
         interaction.deferUpdate();
         catchNewError(error);
      }
   }
}

export function airingSeasonalButtonRow(page: number, authorId: string, hasNext: boolean) {
   const buttonRow = new ButtonRow([
      backPageButton({ page: page - 1, authorId }),
      nextPageButton({ page: page + 1, authorId }),
   ]);

   if (page <= 1) buttonRow.hideButton([0]);
   if (!hasNext) buttonRow.hideButton([1]);

   return buttonRow;
}

export interface SeasonalPageOptions {
   page: number;
}

function nextPageButton(buttonData: ButtonData) {
   const customIdValues: ButtonTuple = [
      "airingSeasonal.button",
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
      "airingSeasonal.button",
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
type ButtonTuple = [customId: string, authorId: string, page: number];

function extractButtonId(arr: ButtonTuple) {
   const obj: ButtonInterface = {
      customId: arr[0],
      authorId: arr[1],
      page: arr[2],
   };

   return obj;
}
