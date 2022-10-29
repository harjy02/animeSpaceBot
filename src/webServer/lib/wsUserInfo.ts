import fetch, { RequestInit } from "node-fetch";

import { getAuthData } from "cluster/anilist/libs/authData";
import { decrypt } from "lib/crypto/decrypt";
import { loginKey } from "assets/config";

export async function getWsUserInfo(guildId: string, discordId: string) {
   const authData = await getAuthData(guildId, discordId);

   if (!authData) throw new Error("no auth data");

   const accessToken = authData.accessToken;
   const decryptedAccessToken = decrypt(loginKey, accessToken);

   const requestInit: RequestInit = {
      method: "POST",
      headers: {
         "Authorization": "Bearer " + decryptedAccessToken,
         "Content-Type": "application/json",
         "Accept": "application/json",
      },
      body: JSON.stringify({
         query: anilistQuery,
      }),
   };

   const fetchData = await fetch("https://graphql.anilist.co", requestInit)
      .then(async (response) => {
         const result = await response.text();
         if (!response.ok) {
            throw new Error(result);
         } else {
            const json = await JSON.parse(result);
            return json.data.Viewer as AnilistQuery;
         }
      })
      .catch((error) => {
         throw error;
      });

   const returnData: WsUserData = {
      name: fetchData.name,
      id: fetchData.id,
      siteUrl: fetchData.siteUrl,
      avatar: fetchData.avatar.large,
   };

   return returnData;
}

export interface WsUserData {
   name: string;
   id: string;
   siteUrl: string;
   avatar: string;
}

interface AnilistQuery {
   name: string;
   siteUrl: string;
   id: string;
   avatar: {
      large: string;
   };
}

const anilistQuery = /* GraphQL */ `
   {
      Viewer {
         name
         siteUrl
         id
         avatar {
            large
         }
      }
   }
`;
