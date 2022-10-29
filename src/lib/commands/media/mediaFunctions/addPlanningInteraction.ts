import {
   ColorResolvable,
   Message,
   MessageActionRow,
   MessageButton,
   MessageComponentInteraction,
   MessageEmbed,
} from "discord.js";

import { catchNewError } from "lib/errors/errorHandling";
import { addPlanning } from "lib/commands/media/mediaFunctions/addPlanning";
import fetch from "node-fetch";
import { unAuthenticated } from "lib/templates/unAuthenticated";
import { getAuthData } from "cluster/anilist/libs/authData";
import { decrypt } from "lib/crypto/decrypt";
import { loginKey } from "assets/config";
import type AuthData from "cluster/anilist/models/authData";
import { findOrCreateDiscordGuild } from "cluster/anilist/libs/discordGuild";

export async function addPlanningInteraction(
   interaction: MessageComponentInteraction,
   data: AddPlanningData,
) {
   try {
      //#region [args]

      const guild =
         interaction.channel?.type === "DM"
            ? await findOrCreateDiscordGuild({ id: "0", name: "DM" })
            : interaction.guild;

      //#endregion

      if (!guild) return interaction.reply("Command usable only in a guild or in dm");

      const authData = await getAuthData(guild.id, interaction.user.id);
      if (!authData) return unAuthenticated(interaction, { ephemeral: true });

      const animeData = await fetch("https://graphql.anilist.co", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
         },
         body: JSON.stringify({
            query: /* GraphQL */ `
               query ($idMal: Int) {
                  Media(idMal: $idMal) {
                     title {
                        english
                        romaji
                     }
                     coverImage {
                        color
                        large
                     }
                     siteUrl
                     id
                     idMal
                  }
               }
            `,
            variables: { idMal: data.idMal },
         }),
      })
         .then((response) => response.text())
         .then((result) => JSON.parse(result))
         .then((json) => {
            if (!json.data || !json.data.Media) return "not found";

            return json.data.Media as MediaData;
         })
         .catch((error) => {
            throw error;
         });

      if (animeData === "not found")
         throw new Error(`in add anime button media not found, ${data}`);

      // definitions

      const idMal = animeData.idMal;
      const idAl = animeData.id;
      const title = animeData.title.english || animeData.title.romaji;
      const color = animeData.coverImage.color;
      const thumbnail = animeData.coverImage.large;
      const siteUrl = animeData.siteUrl;

      // authentication elaboration

      const { status } = await parseAuthentication(idMal, authData);

      const characterEmbed = new MessageEmbed()
         .setColor(color)
         .setTitle(title)
         .setURL(siteUrl)
         .setThumbnail(thumbnail)
         .setDescription(
            status
               ? `Anime already in your list!\n\n**\`Status\`** ↬ \`${status}\``
               : `Add \`${title}\` to the planning list?`,
         )
         .setTimestamp();

      if (status)
         return await interaction.reply({ embeds: [characterEmbed], ephemeral: true });

      const row = new MessageActionRow().addComponents(
         new MessageButton()
            .setCustomId("add")
            .setLabel("Add to Planning")
            .setStyle("SUCCESS"),
         new MessageButton().setCustomId("exit").setLabel("Exit").setStyle("DANGER"),
      );

      const sent = (await interaction.reply({
         embeds: [characterEmbed],
         components: [row],
         ephemeral: true,
         fetchReply: true,
      })) as Message;

      const collector = sent.createMessageComponentCollector({
         idle: 50000,
      });

      collector.on("collect", async (collectInteraction) => {
         if (collectInteraction.user.id !== interaction.user.id) {
            return collectInteraction.reply({
               content: "This interaction is not for you..",
               ephemeral: true,
            });
         }

         switch (collectInteraction.customId) {
            case "add": {
               const response = await addPlanning(authData, idAl);

               if (response === true) {
                  return collectInteraction.update({
                     embeds: [
                        characterEmbed.setDescription(
                           `Success!\nThe anime \`${title}\` has been added to your planning list`,
                        ),
                     ],
                     components: [],
                  });
               } else {
                  return collectInteraction.update({
                     embeds: [
                        characterEmbed.setDescription(
                           `Error!\n**There was a problem** and the anime \`${title}\` hasn't been added to your planning list\n\nIf the problem keeps coming out report it to the support server!!`,
                        ),
                     ],
                  });
               }
            }
            case "exit": {
               return collectInteraction.update({
                  embeds: [
                     characterEmbed.setDescription(
                        `Denied!\nThe anime \`${title}\` hasn't been added to your planning list`,
                     ),
                  ],
                  components: [],
               });
            }
         }
      });
   } catch (error: any) {
      interaction.deferUpdate();
      catchNewError(error);
   }
}

async function parseAuthentication(idMal: number, authData: AuthData) {
   const accessToken = authData.accessToken;
   const decryptedToken = decrypt(loginKey, accessToken);

   const status: string | undefined = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
         "Authorization": "Bearer " + decryptedToken,
         "Content-Type": "application/json",
         "Accept": "application/json",
      },
      body: JSON.stringify({
         query: /* GraphQL */ `
            query ($idMal: Int) {
               Media(idMal: $idMal) {
                  mediaListEntry {
                     status
                  }
               }
            }
         `,
         variables: { idMal },
      }),
   })
      .then((response) => response.text())
      .then((result) => JSON.parse(result))
      .then((json) => {
         if (json.data.Media.mediaListEntry) return json.data.Media.mediaListEntry.status;
         else return undefined;
      })
      .catch((error) => catchNewError(error));

   return { status };
}

interface MediaData {
   title: {
      romaji: string;
      english: string;
   };
   coverImage: {
      color: ColorResolvable;
      large: string;
   };
   siteUrl: string;
   id: number;
   idMal: number;
}

interface AddPlanningData {
   idAl: number;
   idMal: number;
}
