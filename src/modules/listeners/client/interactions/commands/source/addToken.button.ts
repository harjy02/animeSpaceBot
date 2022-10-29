import { ButtonInteraction, MessageButton } from "discord.js";
import { catchNewError } from "lib/errors/errorHandling";
import { Listener } from "@sapphire/framework";
import { addSourceTokenModal } from "./addToken.modal";

export default class extends Listener {
   public async run(interaction: ButtonInteraction /*, arr: ButtonTuple*/) {
      try {
         //const obj = extractButtonId(arr);

         //#region [args]

         // const customId = obj.customId;
         //const authorId = obj.authorId;

         //#endregion

         /*
         if (interaction.user.id !== authorId) {
            return interaction.reply({
               content: "This interaction is not for you..",
               ephemeral: true,
            });
         }
         */

         const modal = addSourceTokenModal();

         interaction.showModal(modal);
      } catch (error: any) {
         interaction.deferUpdate();
         catchNewError(error);
      }
   }
}

export function addSourceTokenButton() {
   const customIdValues: ButtonTuple = ["addToken.button"];

   const button = new MessageButton()
      .setCustomId(JSON.stringify(customIdValues))
      .setLabel("Input the SauceNao api key")
      .setStyle("SUCCESS");

   return button;
}

/*
interface ButtonInterface {
   customId: string;
}
*/

type ButtonTuple = [customId: string];

/*
function extractButtonId(arr: ButtonTuple) {
   const obj: ButtonInterface = {
      customId: arr[0],
   };

   return obj;
}
*/
