import type { List, ListData, Status } from "../mediaList";
import fetch, { RequestInit } from "node-fetch";

import type { DeepNullable } from "typings/other/deepNullable";
import type { MediaFormat } from "typings/anilist/media";

export async function getAnilistAnimeList(
   authId: string,
   status: Status,
   page: number,
   perPage: number,
) {
   const statusData = getStatus(status);

   const requestInit: RequestInit = {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "Accept": "application/json",
      },
      body: JSON.stringify({
         query: listQuery,
         variables: {
            userId: authId,
            status: statusData,
            page,
            perPage,
         },
      }),
   };

   const fetchData = await fetch("https://graphql.anilist.co", requestInit)
      .then(async (response) => {
         const result = await response.text();
         if (!response.ok) {
            throw new Error(result);
         } else {
            const json = await JSON.parse(result);
            return json as DeepNullable<AnilistQuery>;
         }
      })
      .catch((error) => {
         throw error;
      });

   const data = fetchData?.data?.Page;

   const list: List[] = [];

   if (data?.mediaList) {
      for (const anime of data.mediaList) {
         if (anime?.private) {
            list.push({
               title: "Media set as private",
               format: "n/a",
               siteUrl: `https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley`,
               score: "Null",
               progress: "Null",
            });
         } else {
            list.push({
               title:
                  anime?.media?.title?.english || anime?.media?.title?.romaji || "N/A",
               format: anime?.media?.format || "n/a",
               siteUrl: `https://anilist.co/anime/${anime?.media?.id}`,
               score: anime?.score || "Null",
               progress: anime?.progress || "Null",
            });
         }
      }
   }

   const animeList: ListData = {
      list,
      hasNext: data?.pageInfo?.hasNextPage || false,
      total: data?.pageInfo?.total || 0,
   };

   return animeList;
}

function getStatus(status: Status) {
   switch (status) {
      case "Completed":
         return "COMPLETED";
      case "Current":
         return "CURRENT";
      case "Dropped":
         return "DROPPED";
      case "Paused":
         return "PAUSED";
      case "Planning":
         return "PLANNING";
   }
}

const listQuery = /* GraphQL */ `
   query ($userId: Int, $status: MediaListStatus, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
         pageInfo {
            hasNextPage
            total
         }
         mediaList(userId: $userId, status: $status, sort: FINISHED_ON_DESC) {
            media {
               title {
                  romaji
                  english
               }
               id
               format
            }
            score
            progress
            private
         }
      }
   }
`;

interface AnilistQuery {
   data: {
      Page: {
         pageInfo: {
            hasNextPage: boolean;
            total: number;
         };
         mediaList: {
            media: {
               title: {
                  romaji: string;
                  english: string;
               };
               id: number;
               format: MediaFormat;
            };
            score: number;
            progress: number;
            private: boolean;
         }[];
      };
   };
}
