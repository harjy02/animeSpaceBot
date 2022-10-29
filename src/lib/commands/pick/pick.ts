import fetch, { RequestInit } from "node-fetch";

import type { DeepNullable } from "typings/other/deepNullable";
import { MessageEmbed } from "discord.js";
import { compactAnimeOverview } from "lib/commands/media/mediaSearch/compactMedia/compactAnimeOverview";
import { compactMangaOverview } from "lib/commands/media/mediaSearch/compactMedia/compactMangaOverview";
import { getRandomInt } from "lib/tools/other/getRandomInt";
import type UserData from "cluster/anilist/models/userData";

interface Cache {
   anime: MessageEmbed[];
   manga: MessageEmbed[];
}

export class Pick {
   private userData: UserData;
   private discordGuildId: string;
   private discordUserId: string;

   constructor(userData: UserData, discordGuildId: string, discordUserId: string) {
      this.userData = userData;
      this.discordGuildId = discordGuildId;
      this.discordUserId = discordUserId;

      this.animeTotal = this.setPlanningData("ANIME");
      this.mangaTotal = this.setPlanningData("MANGA");
   }

   private cache: Cache = {
      anime: [],
      manga: [],
   };

   public async pickFromPlanning(type: "ANIME" | "MANGA") {
      if (type === "ANIME") {
         if (!this.cache.anime.length) {
            if ((await this.animeTotal) === 0) return this.noMedia(type);

            this.pickAnime();
            await this.pickAnime();

            return this.cache.anime.shift()!;
         } else {
            this.pickAnime();
            return this.cache.anime.shift()!;
         }
      } else {
         if (!this.cache.manga.length) {
            if ((await this.mangaTotal) === 0) return this.noMedia(type);

            this.pickManga();
            await this.pickManga();

            return this.cache.manga.shift()!;
         } else {
            this.pickManga();
            return this.cache.manga.shift()!;
         }
      }
   }

   private async pickAnime() {
      const randomPick = getRandomInt(0, await this.animeTotal);

      const randomAnime = await this.getPlanningData("ANIME", randomPick);

      const data = randomAnime.data?.Page?.mediaList?.[0]?.media;

      const idMal = data?.idMal!;
      const idAl = data?.id!;

      const animeData = await compactAnimeOverview(
         this.discordGuildId,
         this.discordUserId,
         idAl,
         idMal,
      );
      return this.cache.anime.push(
         animeData.embed.setFooter({
            text: `Choose from ${await this.animeTotal} medias`,
         }),
      );
   }

   private async pickManga() {
      const randomPick = getRandomInt(0, await this.mangaTotal);

      const randomManga = await this.getPlanningData("MANGA", randomPick);

      const data = randomManga.data?.Page?.mediaList?.[0]?.media;

      const idMal = data?.idMal!;
      const idAl = data?.id!;

      const mangaData = await compactMangaOverview(
         this.discordGuildId,
         this.discordUserId,
         idAl,
         idMal,
      );
      return this.cache.manga.push(
         mangaData.embed.setFooter({
            text: `Choose from ${await this.mangaTotal} medias`,
         }),
      );
   }

   private animeTotal: Promise<number>;
   private mangaTotal: Promise<number>;
   private async setPlanningData(type: "ANIME" | "MANGA") {
      const fetchData = await this.getPlanningData(type, 1);

      return fetchData.data?.Page?.pageInfo?.total || 0;
   }

   private async getPlanningData(type: "ANIME" | "MANGA", page: number) {
      const requestInit: RequestInit = {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
         },
         body: JSON.stringify({
            query,
            variables: {
               userId: this.userData.AL_Id,
               page,
               type,
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
               return json as DeepNullable<Query>;
            }
         })
         .catch((error) => {
            throw error;
         });

      return fetchData;
   }

   private noMedia(type: "ANIME" | "MANGA") {
      return new MessageEmbed().setDescription(
         `There isn't any media in your ${type.toLowerCase()} media planning list to choose from`,
      );
   }
}

const query = /* GraphQL */ `
   query ($userId: Int, $type: MediaType, $page: Int) {
      Page(page: $page, perPage: 1) {
         pageInfo {
            total
         }
         mediaList(userId: $userId, status: PLANNING, type: $type) {
            media {
               idMal
               id
            }
         }
      }
   }
`;

interface Query {
   data: {
      Page: {
         pageInfo: {
            total: number;
         };
         mediaList: [
            {
               media: {
                  idMal: number;
                  id: number;
               };
            },
         ];
      };
   };
}
