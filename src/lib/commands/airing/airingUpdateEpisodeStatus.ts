import { loginKey } from "assets/config";
import AuthData from "cluster/anilist/models/authData";
import { decrypt } from "lib/crypto/decrypt";
import fetch from "node-fetch";
import { FuzzyDateInput, Status } from "typings/anilist/media";

export async function airingUpdateEpisodeStatus(
   authData: AuthData,
   idAl: number,
   progress: number,
   status: Status,
   score?: number,
   startedAt?: FuzzyDateInput,
   completedAt?: FuzzyDateInput,
) {
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
         query: mutationQuery,
         variables: {
            mediaId: idAl,
            progress,
            status,
            score,
            startedAt,
            completedAt,
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

            return json as MutationQuery;
         }
      })
      .catch((error) => {
         throw error;
      });

   return fetchData;
}

export interface MutationQuery {
   data: {
      SaveMediaListEntry: {
         status: Status;
         progress: number;
         score: number;
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
         media: {
            title: {
               english: string;
               romaji: string;
            };
            coverImage: {
               large: string;
               color: string;
            };
            siteUrl: string;
         };
         user: {
            avatar: {
               large: string;
            };
            name: string;
            siteUrl: string;
         };
      };
   };
}

const mutationQuery = /* GraphQL */ `
   mutation (
      $mediaId: Int
      $progress: Int
      $status: MediaListStatus
      $score: Float
      $startedAt: FuzzyDateInput
      $completedAt: FuzzyDateInput
   ) {
      SaveMediaListEntry(
         mediaId: $mediaId
         progress: $progress
         status: $status
         score: $score
         startedAt: $startedAt
         completedAt: $completedAt
      ) {
         status
         progress
         score
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
         media {
            title {
               english
               romaji
            }
            coverImage {
               large
               color
            }
            siteUrl
         }
         user {
            avatar {
               large
            }
            name
            siteUrl
         }
      }
   }
`;
