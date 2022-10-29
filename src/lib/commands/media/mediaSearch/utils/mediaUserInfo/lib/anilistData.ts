import fetch, { RequestInit } from "node-fetch";

import type { DeepNullable } from "typings/other/deepNullable";
import type { UserInfoData } from "../getMediaUserInfo";
import type UserData from "cluster/anilist/models/userData";

export async function getAnilistData(
   user: UserData,
   idAl: number,
   type: "ANIME" | "MANGA",
) {
   const id = user.AL_Id;
   const name = user.AL_Username;

   const requestInit: RequestInit = {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "Accept": "application/json",
      },
      body: JSON.stringify({
         query: viewerQuery,
         variables: { userId: id, idAl, type },
      }),
   };

   const fetchData = await fetch("https://graphql.anilist.co", requestInit)
      .then(async (response) => {
         const result = await response.text();

         if (response.statusText.includes("Not Found") && response.status === 404)
            return "n/a";

         if (!response.ok) {
            throw new Error(result);
         } else {
            const json = await JSON.parse(result);
            if (!json.data || !json.data.MediaList) return "n/a";
            return json as DeepNullable<ViewerQuery>;
         }
      })
      .catch((error) => {
         throw error;
      });

   if (fetchData === "n/a") {
      return {
         userData: undefined,
         name,
         siteUrl: `https://anilist.co/user/${id}`,
      } as UserInfoData;
   } else {
      const data = fetchData?.data?.MediaList;
      return {
         userData: {
            status: data?.status,
            score: data?.score,
            progress: data?.progress,
            scoreFormat: data?.user?.mediaListOptions?.scoreFormat,
         },
         name,
         siteUrl: `https://anilist.co/user/${id}`,
      } as UserInfoData;
   }
}

const viewerQuery = /* GraphQL */ `
   query ($userId: Int, $idAl: Int, $type: MediaType) {
      MediaList(userId: $userId, mediaId: $idAl, type: $type) {
         status
         score
         progress
         user {
            mediaListOptions {
               scoreFormat
            }
         }
      }
   }
`;

interface ViewerQuery {
   data: {
      MediaList: {
         status: string;
         score: number;
         progress: number;
         user: {
            mediaListOptions: {
               scoreFormat: ScoreFormat;
            };
         };
      };
   };
}

export type ScoreFormat =
   | "POINT_100"
   | "POINT_10_DECIMAL"
   | "POINT_10"
   | "POINT_5"
   | "POINT_3";
