import {
   anilist_credential,
   discord_credential,
   envWebServerPort,
   loginKey,
   supportServerInviteLink,
   webServerDiscordRedirect,
} from "assets/config";
import { StateData, pkceCodeMap, stateCodeMap } from "global/webServer";
import { blue, yellow } from "colorette";
import fetch from "node-fetch";
import { setConfirmHtml, setErrorHtml, setWrongAccountHtml } from "./response";

import { catchNewError } from "lib/errors/errorHandling";
import type { Server } from "http";
import { URLSearchParams } from "url";
import { container } from "@sapphire/framework";
import express, { Response } from "express";
import { getWsUserInfo } from "./lib/wsUserInfo";
import { encrypt } from "lib/crypto/encrypt";
import { findOrCreateDiscordUser } from "cluster/anilist/libs/discordUser";
import { setAuthData } from "cluster/anilist/libs/authData";
import { setUserData } from "cluster/anilist/libs/userData";
import { findOrCreateDiscordGuild } from "cluster/anilist/libs/discordGuild";

const catchWithResponse = (error: any, response: Response) => {
   catchNewError(error);

   return response.send(
      `Oh no.. There seems to be some problems.., if this error persists consider reporting it to the [support discord server](${supportServerInviteLink}).`,
   );
};

const tokenMap = new Map();
export class AnilogWS {
   private server: Server;

   constructor() {
      const app = express();

      app.get("/malLogin", async (req, res) => {
         try {
            if (req.query.error === "access_denied") return res.send("access denied");
            if (req.url.includes("?code=")) {
               const code = req.query.code;
               const ip = req.ip;

               tokenMap.set(ip, { source: "myanimelist", code });

               res.redirect(webServerDiscordRedirect(req.query.state as string));
               return res.end();
            } else {
               return res.send("there wasn't any code in the url");
            }
         } catch (error: any) {
            return catchWithResponse(error, res);
         }
      });

      app.get("/anilistLogin", async (req, res) => {
         try {
            if (req.query.error === "access_denied")
               return res.send(setErrorHtml("access denied"));
            if (req.url.includes("?code=")) {
               const code = req.query.code;
               const ip = req.ip;

               tokenMap.set(ip, { source: "anilist", code });

               res.redirect(webServerDiscordRedirect(req.query.state as string));
               return res.end();
            } else {
               return res.send("there wasn't any code in the url");
            }
         } catch (error: any) {
            return catchWithResponse(error, res);
         }
      });

      app.get("/discordLogin", async (req, res) => {
         try {
            if (req.query.error === "access_denied")
               return res.send(setErrorHtml("access denied"));

            const discordCode = req.query.code as string;

            const access_token = await fetch("https://discord.com/api/oauth2/token", {
               method: "POST",
               headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
               },
               body: new URLSearchParams({
                  grant_type: "authorization_code",
                  client_id: discord_credential.client_id,
                  client_secret: discord_credential.client_secret,
                  redirect_uri: discord_credential.redirect_url,
                  code: discordCode,
                  scope: "identify",
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

            interface UserObject {
               id: string;
               username: string;
            }

            const userObject = await fetch("https://discord.com/api/users/@me", {
               method: "GET",
               headers: {
                  Authorization: `Bearer ${access_token}`,
               },
            })
               .then(async (response) => {
                  const result = await response.text();
                  if (!response.ok) {
                     throw new Error(result);
                  } else {
                     const json = await JSON.parse(result);
                     return json as UserObject;
                  }
               })
               .catch((error) => {
                  throw error;
               });

            const discordId = userObject.id;
            const discordUsername = userObject.username;

            //__<pkce_account_verification>

            const stateCode = req.query.state;

            if (!stateCode)
               return res.send(setErrorHtml("Something seems to be missing"));

            const pkce = pkceCodeMap.get(stateCode as string);

            if (!pkce) return res.send(setErrorHtml("The request has expired."));

            //__</pkce_account_verification>

            //__<user_verification>

            const stateData: StateData | undefined = stateCodeMap.get(
               stateCode as string,
            );
            if (!stateData) return res.send(setErrorHtml("The request has expired."));

            if (stateData.author.id !== discordId) return res.send(setWrongAccountHtml()); // message informing

            //__</user_verification>

            const ip = req.ip;
            const codeObject = tokenMap.get(ip);

            const source = codeObject.source;
            const code = codeObject.code;

            switch (source) {
               case "anilist": {
                  const alAccessToken = await fetch(
                     "https://anilist.co/api/v2/oauth/token",
                     {
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
                           code, // The Authorization Code received previously
                        }),
                     },
                  )
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
                     id: discordId,
                     username: discordUsername,
                  });

                  const discordGuild = await findOrCreateDiscordGuild(stateData.guild);

                  await setAuthData(
                     discordGuild,
                     discordUser,
                     encrypt(loginKey, alAccessToken),
                     "",
                  );

                  const userData = await getWsUserInfo(stateData.guild.id, discordId);

                  await setUserData(
                     discordGuild,
                     discordUser,
                     userData.name,
                     userData.id,
                  );

                  return res.send(
                     await setConfirmHtml(stateData.guild, stateData.author, userData),
                  );
               }
            }
            return;
         } catch (error: any) {
            return catchWithResponse(error, res);
         }
      });

      this.server = app.listen(envWebServerPort, () => {
         container.logger.info(
            blue(`AnilogWS loaded, listening on port ${yellow(envWebServerPort)}`),
         );
      });
   }

   async stop(): Promise<any> {
      this.server.close((error) => {
         if (error) return catchNewError(error);

         container.logger.info("AnilogWS webserver stopped..");
         return;
      });
   }
}
