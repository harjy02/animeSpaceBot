import {
   MessageActionRow,
   Modal,
   ModalActionRowComponent,
   ModalSubmitInteraction,
   TextInputComponent,
} from "discord.js";
import { catchNewError } from "lib/errors/errorHandling";
import { Listener } from "@sapphire/framework";
import { anilist_credential } from "assets/config";
import { findOrCreateDiscordUser } from "cluster/anilist/libs/discordUser";
import fetch from "node-fetch";
import { findOrCreateDiscordGuild } from "cluster/anilist/libs/discordGuild";
import { setAuthData } from "cluster/anilist/libs/authData";
import { getWsUserInfo } from "webServer/lib/wsUserInfo";
import { setUserData } from "cluster/anilist/libs/userData";

export default class extends Listener {
   public async run(interaction: ModalSubmitInteraction) {
      try {
         //#region [args]

         // const customId = obj.customId;
         //const authorId = obj.authorId;

         const authorId = interaction.user.id;
         const authorUsername = interaction.user.username;

         const guild =
            interaction.channel?.type === "DM"
               ? await findOrCreateDiscordGuild({ id: "0", name: "DM" })
               : interaction.guild;

         // #endregion

         if (!guild)
            return interaction.reply("command only executable in a guild or in dm");

         const token = await interaction.fields.getTextInputValue("token").trim();

         const alAccessToken = await fetch("https://anilist.co/api/v2/oauth/token", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               "Accept": "application/json",
            },
            body: JSON.stringify({
               grant_type: "authorization_code",
               client_id: anilist_credential.client_id,
               client_secret: anilist_credential.client_secret,
               redirect_uri: anilist_credential.redirect_url, // http://example.com/callback
               code: token, // The Authorization Code received previously
            }),
         })
            .then(async (response) => {
               const result = await response.text();
               if (!response.ok) {
                  throw new Error(result);
               } else {
                  const json = await JSON.parse(result);
                  return json.access_token as string;
               }
            })
            .catch((error) => {
               throw error;
            });

         const discordUser = await findOrCreateDiscordUser({
            id: authorId,
            username: authorUsername,
         });

         const discordGuild = await findOrCreateDiscordGuild({
            id: guild.id,
            name: guild.name,
         });

         await setAuthData(discordGuild, discordUser, alAccessToken, "");

         const userData = await getWsUserInfo(guild.id, authorId);

         await setUserData(discordGuild, discordUser, userData.name, userData.id);

         return interaction.reply("logged in successfully");
      } catch (error: any) {
         interaction.deferUpdate();
         catchNewError(error);
      }
   }
}

export function loginModal() {
   const customIdValues: ModalTuple = ["login.modal"];

   const tokenInput = new TextInputComponent()
      .setCustomId("token")
      // The label is the prompt the user sees for this input
      .setLabel("The copied Anilist token")
      // Short means only a single line of text
      .setStyle("SHORT");

   const firstActionRow = new MessageActionRow<ModalActionRowComponent>().addComponents(
      tokenInput,
   );

   const modal = new Modal()
      .setCustomId(JSON.stringify(customIdValues))
      .setTitle("Anilist Token login")
      .addComponents(firstActionRow);

   return modal;
}

type ModalTuple = [customId: string];
