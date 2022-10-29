import { catchNewError } from "lib/errors/errorHandling";
import type { MessageEmbed } from "discord.js";
import { compactAnimeOverview } from "../media/mediaSearch/compactMedia/compactAnimeOverview";
import { compactMangaOverview } from "../media/mediaSearch/compactMedia/compactMangaOverview";
import fetch from "node-fetch";

//const maxAnime = maxAnimeNumber();
//const maxManga = maxMangaNumber();

export interface RandomAnimeData {
   embed: MessageEmbed;
   idAl: number;
   idMal: number;
}

export class RandomMedia {
   private discordUserId: string;
   private discordGuildId: string;

   private animeCache: RandomAnimeData[] = [];
   private mangaCache: RandomAnimeData[] = [];

   constructor(discordGuildId: string, discordUserId: string) {
      this.discordGuildId = discordGuildId;
      this.discordUserId = discordUserId;
   }

   public async getAnime() {
      if (!this.animeCache.length) {
         this.cacheAnime();
         const loadedAnime = await this.loadAnime();
         return loadedAnime;
      } else {
         this.cacheAnime();
         const shifted = this.animeCache.shift();
         if (!shifted) throw new Error("Shifted is undefined while it should not be");
         return shifted;
      }
   }

   public async getManga() {
      if (!this.mangaCache.length) {
         this.cacheManga();
         const loadedManga = await this.loadManga();
         return loadedManga;
      } else {
         this.cacheManga();
         const shifted = this.mangaCache.shift();
         if (!shifted) throw new Error("Shifted is undefined while it should not be");
         return shifted;
      }
   }

   private async loadAnime(): Promise<RandomAnimeData> {
      const newId = await randomAnime();

      const idMal = newId.idMal;
      const idAl = newId.idAl;

      const searchObj = await compactAnimeOverview(
         this.discordGuildId,
         this.discordUserId,
         idAl,
         idMal,
      );

      return {
         embed: searchObj.embed,
         idAl,
         idMal,
      };
   }

   private async loadManga(): Promise<RandomAnimeData> {
      const newId = await randomManga();

      const idMal = newId.idMal;
      const idAl = newId.idAl;

      const searchObj = await compactMangaOverview(this.discordGuildId, this.discordUserId, idAl, idMal);

      return {
         embed: searchObj.embed,
         idAl,
         idMal,
      };
   }

   private async cacheAnime() {
      const newId = await randomAnime();

      const idMal = newId.idMal;
      const idAl = newId.idAl;

      const searchObj = await compactAnimeOverview(
         this.discordGuildId,
         this.discordUserId,
         idAl,
         idMal,
      );

      this.animeCache.push({
         embed: searchObj.embed,
         idAl,
         idMal,
      });
   }

   private async cacheManga() {
      try {
         const newId = await randomManga();

         const idMal = newId.idMal;
         const idAl = newId.idAl;

         const searchObj = await compactMangaOverview(
            this.discordGuildId,
            this.discordUserId,
            idAl,
            idMal,
         );

         this.mangaCache.push({
            embed: searchObj.embed,
            idAl,
            idMal,
         });
      } catch (error: any) {
         catchNewError(error);
      }
   }
}

async function randomManga() {
   //const pagina = Math.round(Math.random() * (await maxManga));
   const pagina = Math.round(Math.random() * 2000);

   const listOptions = {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "Accept": "application/json",
      },
      body: JSON.stringify({
         query: /* GraphQL */ `
            query ($page: Int) {
               Page(page: $page, perPage: 1) {
                  pageInfo {
                     currentPage
                  }
                  media(
                     averageScore_greater: 70
                     isAdult: false
                     type: MANGA
                     format: MANGA
                  ) {
                     idMal
                     id
                  }
               }
            }
         `,
         variables: { page: pagina },
      }),
   };

   const fetchedList = await fetch("https://graphql.anilist.co", listOptions)
      .then(async (response) => {
         const result = await response.text();
         if (!response.ok) {
            throw new Error(result);
         } else {
            const json: RandomMediaFetch = await JSON.parse(result);
            return {
               idMal: json.data.Page.media[0].idMal,
               idAl: json.data.Page.media[0].id,
            };
         }
      })
      .catch((error) => {
         throw error;
      });

   return fetchedList;
}

async function randomAnime() {
   //const pagina = Math.round(Math.random() * (await maxAnime));
   const pagina = Math.round(Math.random() * 1060);

   const listOptions = {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "Accept": "application/json",
      },
      body: JSON.stringify({
         query: /* GraphQL */ `
            query ($page: Int) {
               Page(page: $page, perPage: 1) {
                  pageInfo {
                     currentPage
                  }
                  media(
                     averageScore_greater: 70
                     isAdult: false
                     type: ANIME
                     format: TV
                  ) {
                     idMal
                     id
                  }
               }
            }
         `,
         variables: { page: pagina },
      }),
   };

   const fetchedList = await fetch("https://graphql.anilist.co", listOptions)
      .then(async (response) => {
         const result = await response.text();
         if (!response.ok) {
            throw new Error(result);
         } else {
            const json: RandomMediaFetch = await JSON.parse(result);
            return {
               idMal: json.data.Page.media[0].idMal,
               idAl: json.data.Page.media[0].id,
            };
         }
      })
      .catch((error) => {
         throw error;
      });

   return fetchedList;
}

interface RandomMediaFetch {
   data: {
      Page: {
         pageInfo: {
            currentPage: number;
         };
         media: [
            {
               idMal: number;
               id: number;
            },
         ];
      };
   };
}

// async function maxAnimeNumber() {
//    const listOptions = {
//       method: "POST",
//       headers: {
//          "Content-Type": "application/json",
//          "Accept": "application/json",
//       },
//       body: JSON.stringify({
//          query: /* GraphQL */ `
//             {
//                Page(page: 1, perPage: 1) {
//                   pageInfo {
//                      total
//                   }
//                   media(
//                      averageScore_greater: 70
//                      isAdult: false
//                      type: ANIME
//                      format: TV
//                   ) {
//                      idMal
//                      id
//                   }
//                }
//             }
//          `,
//       }),
//    };

//    const fetchedList = await fetch("https://graphql.anilist.co", listOptions)
//       .then(async (response) => {
//          const result = await response.text();
//          if (!response.ok) {
//             throw new Error(result);
//          } else {
//             const json = await JSON.parse(result);
//             return json.data.Page.pageInfo.total as number;
//          }
//       })
//       .catch((error) => {
//          throw error;
//       });

//    return fetchedList;
// }

// async function maxMangaNumber() {
//    const listOptions = {
//       method: "POST",
//       headers: {
//          "Content-Type": "application/json",
//          "Accept": "application/json",
//       },
//       body: JSON.stringify({
//          query: /* GraphQL */ `
//             {
//                Page(page: 1, perPage: 1) {
//                   pageInfo {
//                      total
//                   }
//                   media(
//                      averageScore_greater: 70
//                      isAdult: false
//                      type: MANGA
//                      format: MANGA
//                   ) {
//                      idMal
//                      id
//                   }
//                }
//             }
//          `,
//       }),
//    };

//    const fetchedList = await fetch("https://graphql.anilist.co", listOptions)
//       .then(async (response) => {
//          const result = await response.text();
//          if (!response.ok) {
//             throw new Error(result);
//          } else {
//             const json = await JSON.parse(result);
//             return json.data.Page.pageInfo.total as number;
//          }
//       })
//       .catch((error) => {
//          throw error;
//       });

//    return fetchedList;
// }
