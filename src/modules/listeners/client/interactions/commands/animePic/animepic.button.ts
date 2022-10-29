import { ButtonInteraction, MessageButton } from "discord.js";
import { sync } from "assets/emoji";
import { catchNewError } from "lib/errors/errorHandling";
import { Listener } from "@sapphire/framework";
import { generateSafebooruImageEmbed } from "lib/commands/animePic/safebooruWrapper";

export default class extends Listener {
   public async run(interaction: ButtonInteraction, arr: ButtonTuple) {
      try {
         const obj = extractButtonId(arr);

         //#region [args]

         // const customId = obj.customId;
         const tag = obj.tag;
         const authorId = obj.authorId;

         //#endregion

         if (interaction.user.id !== authorId) {
            return interaction.reply({
               content: "This interaction is not for you..",
               ephemeral: true,
            });
         }

         const embedData = await generateSafebooruImageEmbed(tag);

         if (!embedData) {
            return interaction.update({
               content:
                  "There isn't any image for this tag as the search is limited to safe for work content",
            });
         }

         interaction.update({
            embeds: [embedData],
         });
      } catch (error: any) {
         interaction.deferUpdate();
         catchNewError(error);
      }
   }
}

export function animePicButton(buttonData: ButtonData) {
   const customIdValues: ButtonTuple = [
      "animepic.button",
      buttonData.authorId,
      buttonData.tag,
   ];

   const button = new MessageButton()
      .setCustomId(JSON.stringify(customIdValues))
      .setLabel("Roll Image")
      .setEmoji(sync.id)
      .setStyle("SUCCESS");

   return button;
}

interface ButtonData {
   authorId: string;
   tag: string;
}
interface ButtonInterface extends ButtonData {
   customId: string;
}

type ButtonTuple = [customId: string, authorId: string, tag: string];

function extractButtonId(arr: ButtonTuple) {
   const obj: ButtonInterface = {
      customId: arr[0],
      authorId: arr[1],
      tag: arr[2],
   };

   return obj;
}
