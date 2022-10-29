import { loginKey } from "assets/config";
import AuthData from "cluster/anilist/models/authData";
import { decrypt } from "lib/crypto/decrypt";
import fetch from "node-fetch";
import { Status } from "typings/anilist/media";

export async function airingGetEpisodeData(authData: AuthData, idAl: number) {
   const hash = authData.accessToken;
   const token = decrypt(loginKey, hash);
   const mutationOptions = {
      method: "POST",
      headers: {
         "Authorization": "Bearer " + token,
         "Content-Type": "application/json",
         "Accept": "application/json",
      },
      body: JSON.stringify({
         query: airingEpisodeDataQuery,
         variables: {
            id: idAl,
         },
      }),
   };

   const fetchData = await fetch("https://graphql.anilist.co", mutationOptions)
      .then(async (response) => {
         const result = await response.text();
         if (!response.ok) {
            throw new Error(result);
         } else {
            const json = await JSON.parse(result);
            return json as AiringEpisodeDataQuery;
         }
      })
      .catch((error) => {
         throw error;
      });

   return fetchData;
}

export interface AiringEpisodeDataQuery {
   data: {
      Media: {
         title: {
            english: string;
            romaji: string;
         };
         coverImage: {
            large: string;
            color: string;
         };
         siteUrl: string;
         mediaListEntry: {
            score: number;
            status: Status;
            progress: number;
            startedAt: {
               year: number;
               month: number;
               day: number;
            };
            completedAt: {
               year: number;
               month: number;
               day: number;
            };
         };
      };
      Viewer: {
         avatar: {
            large: string;
         };
         name: string;
         siteUrl: string;
      };
   };
}

const airingEpisodeDataQuery = /* GraphQL */ `
   query ($id: Int) {
      Media(id: $id) {
         title {
            english
            romaji
         }
         coverImage {
            large
            color
         }
         siteUrl
         mediaListEntry {
            score
            status
            progress
            startedAt {
               year
               month
               day
            }
            completedAt {
               year
               month
               day
            }
         }
      }
      Viewer {
         avatar {
            large
         }
         name
         siteUrl
      }
   }
`;
