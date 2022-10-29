import { ButtonInteraction, MessageButton } from "discord.js";

import { catchNewError } from "lib/errors/errorHandling";
import { Listener } from "@sapphire/framework";
import { addPlanningInteraction } from "lib/commands/media/mediaFunctions/addPlanningInteraction";

export default class extends Listener {
   public async run(interaction: ButtonInteraction, arr: AnimeButtonTuple) {
      try {
         const obj = extractAnimeButtonId(arr);

         addPlanningInteraction(interaction, { idAl: obj.idAl, idMal: obj.idMal });
      } catch (error: any) {
         interaction.deferUpdate();
         catchNewError(error);
      }
   }
}

export function addPlanningButton(animeButtonData: AnimeButtonData) {
   const customIdValues: AnimeButtonTuple = [
      "addPlanningButtonListener",
      animeButtonData.idAl,
      animeButtonData.idMal,
   ];

   const addButton = new MessageButton()
      .setCustomId(JSON.stringify(customIdValues))
      .setLabel("Add to Planning")
      .setStyle("SUCCESS");

   return addButton;
}

interface AnimeButtonData {
   idAl: number;
   idMal: number;
}

interface AnimeButtonInterface extends AnimeButtonData {
   customId: string;
}

export type AnimeButtonTuple = [customId: string, idAl: number, idMal: number];

function extractAnimeButtonId(arr: AnimeButtonTuple) {
   const obj: AnimeButtonInterface = {
      customId: arr[0],
      idAl: arr[1],
      idMal: arr[2],
   };

   return obj;
}
