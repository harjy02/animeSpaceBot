import fetch, { RequestInit } from "node-fetch";

import type { MediaFormat } from "typings/anilist/media";
import { getAnilistAnimeList } from "./lib/anilistData";
import { reply } from "assets/emoji";
import { textInline } from "lib/tools/text/textInline";
import { textJoin } from "lib/tools/text/textJoin";
import { textTruncate } from "lib/tools/text/textTruncate";
import type UserData from "cluster/anilist/models/userData";

export type Status = "Current" | "Planning" | "Completed" | "Dropped" | "Paused";

interface CacheList {
   Current: Map<number, MediaListData>;
   Planning: Map<number, MediaListData>;
   Completed: Map<number, MediaListData>;
   Dropped: Map<number, MediaListData>;
   Paused: Map<number, MediaListData>;
}

export class MediaList {
   private cacheList: CacheList = {
      Completed: new Map(),
      Current: new Map(),
      Dropped: new Map(),
      Paused: new Map(),
      Planning: new Map(),
   };

   private userData: UserData;

   private perPage: number;

   constructor(userData: UserData, perPage: number) {
      this.userData = userData;
      this.perPage = perPage;
   }

   public async getList(status: Status, page: number) {
      const listData = this.cacheList[status].get(page);
      if (!listData) {
         const animeListData = await this.anilist(status, page);
         this.cacheList[status].set(page, animeListData);

         this.anilist(status, page + 1).then((data) =>
            this.cacheList[status].set(page + 1, data),
         );

         return animeListData;
      } else {
         if (!this.cacheList[status].has(page + 1)) {
            this.anilist(status, page + 1).then((data) =>
               this.cacheList[status].set(page + 1, data),
            );
         }
         return listData;
      }
   }

   public async getUserInfo() {
      const requestInit: RequestInit = {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
         },
         body: JSON.stringify({
            query: anilistQuery,
            variables: { userId: this.userData.AL_Id },
         }),
      };

      const fetchData = await fetch("https://graphql.anilist.co", requestInit)
         .then(async (response) => {
            const result = await response.text();
            if (!response.ok) {
               throw new Error(result);
            } else {
               const json = await JSON.parse(result);
               return json as AnilistQuery;
            }
         })
         .catch((error) => {
            throw error;
         });

      const data = fetchData.data?.User;

      const userInfo = {
         name: data?.name || "N/A",
         siteUrl: data?.siteUrl || "N/A",
         avatar: data?.avatar?.large || "N/A",
      };

      return userInfo;
   }

   private async anilist(status: Status, page: number) {
      const anilistAnimeList = await getAnilistAnimeList(
         this.userData.AL_Id,
         status,
         page,
         this.perPage,
      );

      const description = setDescription(
         anilistAnimeList.list,
         anilistAnimeList.total,
         status,
         page,
         this.perPage,
      );

      const animeList: MediaListData = {
         description,
         hasNext: anilistAnimeList.hasNext,
      };

      return animeList;
   }
}

function setDescription(
   animeList: List[],
   total: number,
   status: Status,
   page: number,
   perPage: number,
): string {
   const fieldData = [];

   let animeIndex = page * perPage - (perPage - 1);

   // initial description
   fieldData.push("**List statistics:**");
   fieldData.push(`**\`Status\`** ↬ \`${status}\``);
   fieldData.push(`**\`Count\`** ↬ \`${total}\``);
   fieldData.push("");

   //anime fields
   fieldData.push("**Media list:**");
   for (const anime of animeList) {
      fieldData.push(
         `${animeIndex} │[${textTruncate(anime.title, 45)}](${anime.siteUrl} "${
            anime.title
         }")`,
      );
      animeIndex++;
      fieldData.push(
         reply.emoji +
            textInline([
               [
                  {
                     step: `Format ↬ \`${anime.format}\``,
                     spacing: 20,
                  },
                  {
                     step: `Score ↬ _${anime.score}_`,
                     spacing: 17,
                  },
                  {
                     step: `Progress ↬ _${anime.progress}_`,
                     spacing: 0,
                  },
               ],
            ]),
      );
   }
   if (!animeList.length) fieldData.push("No anime in this list");

   return textJoin(fieldData);
}
export interface MediaListData {
   description: string;
   hasNext: boolean;
}

export interface ListData {
   list: List[];
   hasNext: boolean;
   total: number;
}

export interface List {
   title: string;
   format: MediaFormat | "n/a";
   siteUrl: string;
   score: number | "Null";
   progress: number | "Null";
}

interface AnilistQuery {
   data: {
      User: {
         name: string;
         siteUrl: string | null;
         avatar: {
            large: string | null;
         };
      };
   };
}

const anilistQuery = /* GraphQL */ `
   query ($userId: Int) {
      User(id: $userId) {
         name
         siteUrl
         avatar {
            large
         }
      }
   }
`;
