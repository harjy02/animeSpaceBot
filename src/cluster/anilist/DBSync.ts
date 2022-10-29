import { container } from "@sapphire/pieces";
import { green } from "colorette";
import { serverActivityDataCache } from "global/dbCache";
import { setAiringSchedule } from "lib/commands/airing/airingSchedule";
import { catchNewError } from "lib/errors/errorHandling";
import fetch, { RequestInit } from "node-fetch";
import Anime from "./models/anime";
import ServerActivity from "./models/serverActivity";

export async function AnilistDBSync() {
   // await userDataSync();
   // await AuthDataSync();
   await syncServerActivity();
   await syncAnime();
}

// async function userDataSync() {
//    const data = await UserData.findAll();

//    for (const each of data) userDataCache.set(each.FK_DiscordUser, each);
// }

// async function AuthDataSync() {
//    const data = await AuthData.findAll();

//    for (const each of data) authDataCache.set(each.FK_DiscordUser, each);
// }

async function syncServerActivity() {
   const activity = await ServerActivity.findAll();

   for (const each of activity) serverActivityDataCache.set(each.guildId, each);

   container.logger.info(green("ServerActivity data synced"));
}

async function syncAnime() {
   const animeList = await Anime.findAll();

   const now = Date.now();

   const animeToCheck = [];

   for (const eachAnime of animeList) {
      const airingMs = eachAnime.airingTime * 1000;

      if (airingMs > now) setAiringSchedule(eachAnime);
      else animeToCheck.push(eachAnime.idAl);
   }

   if (animeToCheck.length > 0) {
      const scheduleCheckData = await scheduleCheck(animeToCheck);

      for (const eachSchedule of scheduleCheckData) {
         const anime = await Anime.findOne({ where: { idAl: eachSchedule.id } });

         if (anime) {
            if (!eachSchedule.nextAiringEpisode) {
               await anime.destroy();
            } else {
               anime.update({
                  airingTime: eachSchedule.nextAiringEpisode.airingAt,
                  airingEpisode: eachSchedule.nextAiringEpisode.episode,
               });
               setAiringSchedule(anime);
            }
         } else {
            throw catchNewError(
               "there was some problem in getting the scheduled anime from the database",
            );
         }
      }
   }

   container.logger.info(green("Airing notification data synced"));
}

async function scheduleCheck(ids: number[]) {
   const requestInit: RequestInit = {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "Accept": "application/json",
      },
      body: JSON.stringify({
         query: scheduleCheckQuery,
         variables: { idIn: ids },
      }),
   };

   const fetchData = await fetch("https://graphql.anilist.co", requestInit)
      .then(async (response) => {
         const result = await response.text();
         if (!response.ok) {
            throw new Error(result);
         } else {
            const json = await JSON.parse(result);
            return json as ScheduleCheckInterface;
         }
      })
      .catch((error) => {
         throw error;
      });

   return fetchData.data.Page.media;
}

interface ScheduleCheckInterface {
   data: {
      Page: {
         media: {
            title: {
               english: string | null;
               romaji: string | null;
            };
            id: number;
            status: string | null;
            episodes: number | null;
            nextAiringEpisode: {
               episode: number;
               airingAt: number;
            } | null;
         }[];
      };
   };
}

const scheduleCheckQuery = /* GraphQL */ `
   query ($idIn: [Int]) {
      Page(page: 1, perPage: 50) {
         media(id_in: $idIn) {
            title {
               english
               romaji
            }
            id
            status
            episodes
            nextAiringEpisode {
               episode
               airingAt
            }
         }
      }
   }
`;
