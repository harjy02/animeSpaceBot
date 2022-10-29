import { ButtonInteraction, MessageButton } from "discord.js";
import { catchNewError } from "lib/errors/errorHandling";
import { Listener } from "@sapphire/framework";
import { getWaifuEmbed } from "lib/commands/animePic/waifuCollection";

export default class extends Listener {
   public async run(interaction: ButtonInteraction, arr: ButtonTuple) {
      try {
         const obj = extractButtonId(arr);

         //#region [args]

         // const customId = obj.customId;
         const type = obj.type;
         const authorId = obj.authorId;

         //#endregion

         if (interaction.user.id !== authorId) {
            return interaction.reply({
               content: "This interaction is not for you..",
               ephemeral: true,
            });
         }

         const embedData = await getWaifuEmbed(type);

         interaction.update({
            embeds: [embedData],
         });
      } catch (error: any) {
         interaction.deferUpdate();
         catchNewError(error);
      }
   }
}

export function waifuButton(buttonData: ButtonData) {
   const customIdValues: ButtonTuple = [
      "waifu.button",
      buttonData.authorId,
      buttonData.type,
   ];

   const button =
      buttonData.type === "sfw"
         ? new MessageButton()
              .setCustomId(JSON.stringify(customIdValues))
              .setLabel("Roll sfw waifu")
              .setStyle("SUCCESS")
         : new MessageButton()
              .setCustomId(JSON.stringify(customIdValues))
              .setLabel("Roll nsfw waifu")
              .setStyle("DANGER");

   return button;
}

interface ButtonData {
   authorId: string;
   type: "sfw" | "nsfw";
}
interface ButtonInterface extends ButtonData {
   customId: string;
}

type ButtonTuple = [customId: string, authorId: string, type: "sfw" | "nsfw"];

function extractButtonId(arr: ButtonTuple) {
   const obj: ButtonInterface = {
      customId: arr[0],
      authorId: arr[1],
      type: arr[2],
   };

   return obj;
}
