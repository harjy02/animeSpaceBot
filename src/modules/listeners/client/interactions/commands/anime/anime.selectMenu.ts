import { SelectMenuOptions, SelectMenuRow } from "lib/discordComponents/selectMenu";

import { catchNewError } from "lib/errors/errorHandling";
import { Listener } from "@sapphire/framework";
import type { SelectMenuInteraction } from "discord.js";
import { addPlanningInteraction } from "lib/commands/media/mediaFunctions/addPlanningInteraction";
import { animeDescription } from "lib/commands/media/mediaSearch/media/animeMedia/animeDescription";
import { animeOverview } from "lib/commands/media/mediaSearch/media/animeMedia/animeOverview";
import { setComponent } from "lib/discordComponents/component";
import { dmGuild } from "assets/reference";

export default class extends Listener {
   public async run(interaction: SelectMenuInteraction, arr: AnimeMenuTuple) {
      try {
         //#region [args]

         const guild = interaction.channel?.type === "DM" ? await dmGuild : interaction.guild;
         const authorId = arr[1];
         const idAl = arr[2];
         const idMal = arr[3];

         //#endregion

         if (!guild)
            return interaction.reply("command only executable in a guild or in dm");

         if (interaction.user.id !== authorId) {
            return interaction.reply({
               content: "This interaction is not for you..",
               ephemeral: true,
            });
         }

         const value = interaction.values[0] as InteractionOptionsValues;

         switch (value) {
            case "Media overview": {
               const media = await animeOverview(guild.id, authorId, idAl, idMal);

               return interaction.update({
                  embeds: [media.embed],
                  components: setComponent(animeMenu(authorId, idAl, idMal, value)),
               });
            }
            case "Media description": {
               const media = await animeDescription(idAl, idMal);

               return interaction.update({
                  embeds: [media.embed],
                  components: setComponent(animeMenu(authorId, idAl, idMal, value)),
               });
            }
            case "Add to planning the media": {
               return addPlanningInteraction(interaction, {
                  idAl,
                  idMal,
               });
            }
            default: {
               throw new Error(`The tab ${value} is not handled in switch case`);
            }
         }
      } catch (error: any) {
         interaction.deferUpdate();
         catchNewError(error);
      }
   }
}

export function animeMenu(
   authorId: string,
   idAl: number,
   idMal: number,
   placeHolder?: InteractionOptionsValues,
) {
   const customIdValues: AnimeMenuTuple = ["anime.selectMenu", authorId, idAl, idMal];

   const selectMenuOptions: SelectMenuOptions = {
      customId: JSON.stringify(customIdValues),
      placeHolder: `${placeHolder || "Media overview"}`,
      singlePick: true,
      options: [
         {
            label: interactionOptions.MediaOverview,
            value: interactionOptions.MediaOverview,
         },
         {
            label: interactionOptions.MediaDescription,
            value: interactionOptions.MediaDescription,
         },
         {
            label: interactionOptions.AddToPlanning,
            value: interactionOptions.AddToPlanning,
         },
      ],
   };

   return new SelectMenuRow(selectMenuOptions);
}

const interactionOptions = {
   MediaOverview: "Media overview",
   MediaDescription: "Media description",
   AddToPlanning: "Add to planning the media",
} as const;

type InteractionOptionsKeys = keyof typeof interactionOptions;
type InteractionOptionsValues = typeof interactionOptions[InteractionOptionsKeys];

type AnimeMenuTuple = [customId: string, authorId: string, idAl: number, idMal: number];
