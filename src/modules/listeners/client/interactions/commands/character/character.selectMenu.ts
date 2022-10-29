import { SelectMenuOptions, SelectMenuRow } from "lib/discordComponents/selectMenu";

import { catchNewError } from "lib/errors/errorHandling";
import { Listener } from "@sapphire/framework";
import type { SelectMenuInteraction } from "discord.js";
import { characterLongDescription } from "lib/commands/media/mediaSearch/commands/characterMedia/characterLongDescription";
import { characterOverview } from "lib/commands/media/mediaSearch/commands/characterMedia/characterOverview";
import { setComponent } from "lib/discordComponents/component";

export default class extends Listener {
   public async run(interaction: SelectMenuInteraction, arr: CharacterMenuTuple) {
      try {
         const authorId = arr[1];
         const id = arr[2];

         if (interaction.user.id !== authorId) {
            return interaction.reply({
               content: "This interaction is not for you..",
               ephemeral: true,
            });
         }

         const value = interaction.values[0] as InteractionOptionsValues;

         switch (value) {
            case "Character overview": {
               const media = await characterOverview(id);
               if (!media) {
                  throw new Error(
                     "media is null, the id provided probably doesn't exist",
                  );
               }

               return interaction.update({
                  embeds: [media.embed],
                  components: setComponent(characterMenu(authorId, id, value)),
               });
            }
            case "Character long description": {
               const media = await characterLongDescription(id);
               if (!media) {
                  throw new Error(
                     "media is null, the id provided probably doesn't exist",
                  );
               }

               return interaction.update({
                  embeds: [media.embed],
                  components: setComponent(characterMenu(authorId, id, value)),
               });
            }
            default: {
               throw new Error(`The tab ${value} is not handled in switch case`);
            }
         }
      } catch (error: any) {
         //TODO set add data for run args
         interaction.deferUpdate();
         catchNewError(error);
      }
   }
}

export function characterMenu(
   authorId: string,
   id: number,
   placeHolder?: InteractionOptionsValues,
) {
   const customIdValues: CharacterMenuTuple = ["character.selectMenu", authorId, id];

   const selectMenuOptions: SelectMenuOptions = {
      customId: JSON.stringify(customIdValues),
      placeHolder: `${placeHolder || "Media overview"}`,
      singlePick: true,
      options: [
         {
            label: interactionOptions.CharacterOverview,
            value: interactionOptions.CharacterOverview,
         },
         {
            label: interactionOptions.CharacterFullDescription,
            value: interactionOptions.CharacterFullDescription,
         },
      ],
   };

   return new SelectMenuRow(selectMenuOptions);
}

const interactionOptions = {
   CharacterOverview: "Character overview",
   CharacterFullDescription: "Character long description",
} as const;

type InteractionOptionsKeys = keyof typeof interactionOptions;
type InteractionOptionsValues = typeof interactionOptions[InteractionOptionsKeys];

type CharacterMenuTuple = [customId: string, authorId: string, id: number];
