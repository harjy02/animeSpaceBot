import { ButtonInteraction, MessageButton } from "discord.js";
import { ButtonRow } from "lib/discordComponents/button";
import { catchNewError } from "lib/errors/errorHandling";
import { Listener } from "@sapphire/framework";
import { findOrCreateDiscordChannel } from "cluster/anilist/libs/discordChannel";
import { findOrCreateDiscordGuild } from "cluster/anilist/libs/discordGuild";

import { addAiringAnime } from "modules/slash-commands/3)other commands/airing";
import { textTruncate } from "lib/tools/text/textTruncate";

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

         //#region [args]

         const idAl = obj.idAl;
         const channel = interaction.channel;

         //#endregion

         if (!channel) {
            return interaction.reply({
               content: "This command can be run only in a guild/server channel or in DM",
               ephemeral: true,
            });
         }

         const discordChannel =
            channel.type === "DM"
               ? await findOrCreateDiscordChannel(
                    channel.id,
                    "DM",
                    await findOrCreateDiscordGuild({ id: "0", name: "DM" }),
                 )
               : await findOrCreateDiscordChannel(
                    channel.id,
                    channel.name,
                    await findOrCreateDiscordGuild(channel.guild),
                 );

         await addAiringAnime(interaction, idAl, discordChannel);
      } catch (error: any) {
         interaction.deferUpdate();
         catchNewError(error);
      }
   }
}

export function airingAddSeasonalButtonRow(
   authorId: string,
   idAl: number,
   title: string,
) {
   const buttonRow = new ButtonRow([airingAddSeasonalButton({ authorId, idAl, title })]);

   return buttonRow;
}

function airingAddSeasonalButton(buttonData: ButtonData) {
   const customIdValues: ButtonTuple = [
      "airingAddSeasonal.button",
      buttonData.authorId,
      buttonData.idAl,
   ];

   const text = textTruncate(buttonData.title || "", 85);

   const button = new MessageButton()
      .setCustomId(JSON.stringify(customIdValues))
      .setLabel(`Add ${text} to airing`)
      .setStyle("SUCCESS");

   return button;
}

interface ButtonData {
   authorId: string;
   idAl: number;
   title?: string;
}
interface ButtonInterface {
   customId: string;
   authorId: string;
   idAl: number;
}
type ButtonTuple = [customId: string, authorId: string, idAl: number];

function extractButtonId(arr: ButtonTuple) {
   const obj: ButtonInterface = {
      customId: arr[0],
      authorId: arr[1],
      idAl: arr[2],
   };

   return obj;
}
