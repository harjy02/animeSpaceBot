import {
   MessageActionRow,
   MessageEmbed,
   Modal,
   ModalActionRowComponent,
   ModalSubmitInteraction,
   TextInputComponent,
} from "discord.js";
import { catchNewError } from "lib/errors/errorHandling";
import { Listener } from "@sapphire/framework";
import { ResponseType, testSauceNaoToken } from "lib/commands/source/sauceNao";
import { supportServerInviteLink } from "assets/config";
import { createOrUpdateSauceNao } from "cluster/anilist/libs/sauceNao";
import { findOrCreateDiscordUser } from "cluster/anilist/libs/discordUser";

export default class extends Listener {
   public async run(interaction: ModalSubmitInteraction /*, arr: ButtonTuple*/) {
      try {
         //const obj = extractButtonId(arr);

         //#region [args]

         // const customId = obj.customId;
         //const authorId = obj.authorId;

         const authorId = interaction.user.id;
         const authorUsername = interaction.user.username;

         // #endregion

         /*
         if (interaction.user.id !== authorId) {
            return interaction.reply({
               content: "This interaction is not for you..",
               ephemeral: true,
            });
         }
         */

         const token = interaction.fields.getTextInputValue("token").trim();
         const returnedData = await testSauceNaoToken(token);

         const embed = new MessageEmbed();

         if (returnedData.status !== ResponseType.ok) {
            if (returnedData.status === ResponseType.invalidToken) {
               embed.setTitle("Invalid Api-key");
               embed.setColor("RED");
               embed.setDescription(
                  [
                     "The Api-key you've inputted is not valid, check that you have copied it right",
                     "Follow these instructions and try adding again the api-key with the button below",
                     "",
                     "**1)** Go to [SauceNao-login](https://saucenao.com/user.php) create an account and login",
                     "**2)** Got to [SauceNao api-key](https://saucenao.com/user.php?page=search-api) and copy the `api key`",
                     "**3)** Use the button below and input the SauceNao api key",
                     "",
                     `in case you have problems ask for help in the [bot support server](${supportServerInviteLink})`,
                  ].join("\n"),
               );

               interaction.reply({ embeds: [embed], ephemeral: true });
            }
            if (returnedData.status === ResponseType.tooManyRequests) {
               embed.setDescription(
                  [
                     "too many requests were made from the account api key you are trying to add to the bot",
                     "try again later",
                     "",
                     `in case you have problems ask for help in the [bot support server](${supportServerInviteLink})`,
                  ].join("\n"),
               );

               interaction.reply({ embeds: [embed], ephemeral: true });
            }
         } else {
            const discordUser = await findOrCreateDiscordUser({
               id: authorId,
               username: authorUsername,
            });

            const result = await createOrUpdateSauceNao(discordUser, token);

            if (result === "created") {
               embed.setColor("GREEN");
               embed.setTitle("Api-key successfully added");
               embed.setDescription(
                  [
                     "You can now use the `/source` command with the following limitations:",
                     "",
                     `every 30s max: ${returnedData.content?.short_limit} requests ${
                        returnedData.content?.short_remaining !== 0
                           ? `\`(you made ${returnedData.content?.short_remaining})\``
                           : ""
                     }`,
                     `every 24h max: ${returnedData.content?.long_limit} requests ${
                        returnedData.content?.short_remaining !== 0
                           ? `\`(you made ${returnedData.content?.long_remaining})\``
                           : ""
                     }`,
                  ].join("\n"),
               );

               interaction.reply({ embeds: [embed], ephemeral: true });
            }
            if (result === "updated") {
               embed.setColor("GREEN");
               embed.setTitle("Api-key successfully updated");
               embed.setDescription(
                  [
                     "You can now use the `/source` command with the following limitations:",
                     "",
                     `every 30s max: ${returnedData.content?.short_limit} requests ${
                        returnedData.content?.short_remaining !== 0
                           ? `\`(you made ${returnedData.content?.short_remaining})\``
                           : ""
                     }`,
                     `every 24h max: ${returnedData.content?.long_limit} requests ${
                        returnedData.content?.short_remaining !== 0
                           ? `\`(you made ${returnedData.content?.long_remaining})\``
                           : ""
                     }`,
                  ].join("\n"),
               );

               interaction.reply({ embeds: [embed], ephemeral: true });
            }
         }
      } catch (error: any) {
         interaction.deferUpdate();
         catchNewError(error);
      }
   }
}

export function addSourceTokenModal() {
   const customIdValues: ModalTuple = ["addToken.modal"];

   const tokenInput = new TextInputComponent()
      .setCustomId("token")
      // The label is the prompt the user sees for this input
      .setLabel("The copied SauceNao api key")
      // Short means only a single line of text
      .setStyle("SHORT");

   const firstActionRow = new MessageActionRow<ModalActionRowComponent>().addComponents(
      tokenInput,
   );

   const modal = new Modal()
      .setCustomId(JSON.stringify(customIdValues))
      .setTitle("SauceNao api key register")
      .addComponents(firstActionRow);

   return modal;
}

/*
interface ButtonInterface {
   customId: string;
}
*/

type ModalTuple = [customId: string];

/*
function extractButtonId(arr: ButtonTuple) {
   const obj: ButtonInterface = {
      customId: arr[0],
   };

   return obj;
}
*/
