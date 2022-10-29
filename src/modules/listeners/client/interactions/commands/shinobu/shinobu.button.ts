import { ButtonInteraction, MessageButton } from "discord.js";
import { catchNewError } from "lib/errors/errorHandling";
import { Listener } from "@sapphire/framework";
import { getShinobuEmbed } from "lib/commands/animePic/shinobuCollector";

export default class extends Listener {
   public async run(interaction: ButtonInteraction, arr: ButtonTuple) {
      try {
         const obj = extractButtonId(arr);

         //#region [args]

         // const customId = obj.customId;
         const authorId = obj.authorId;

         //#endregion

         if (interaction.user.id !== authorId) {
            return interaction.reply({
               content: "This interaction is not for you..",
               ephemeral: true,
            });
         }

         const embedData = await getShinobuEmbed();

         interaction.update({
            embeds: [embedData],
         });
      } catch (error: any) {
         interaction.deferUpdate();
         catchNewError(error);
      }
   }
}

export function shinobuButton(authorId: string) {
   const customIdValues: ButtonTuple = ["shinobu.button", authorId];

   const button = new MessageButton()
      .setCustomId(JSON.stringify(customIdValues))
      .setLabel("Roll shinobu")
      .setStyle("SUCCESS");

   return button;
}

interface ButtonInterface {
   customId: string;
   authorId: string;
}

type ButtonTuple = [customId: string, authorId: string];

function extractButtonId(arr: ButtonTuple) {
   const obj: ButtonInterface = {
      customId: arr[0],
      authorId: arr[1],
   };

   return obj;
}
