import { EmbedFieldData, MessageEmbed } from "discord.js";
import { FavouriteData, getViewer } from "./data/getViewer";

import { catchNewError } from "lib/errors/errorHandling";
import { getActivity } from "./data/getActivity";
import { getFollower } from "./data/getFollower";
import { getFollowing } from "./data/getFollowing";
import { textJoin } from "lib/tools/text/textJoin";
import type UserData from "cluster/anilist/models/userData";

export async function generateProfile(user: UserData | number) {
   const authId = typeof user === "number" ? String(user) : user.AL_Id;
   const userInfo = await profileUserData(authId);

   const followers = userInfo.followers || "N/A";
   const following = userInfo.following || "N/A";
   const activityData = [];
   if (userInfo.activity) {
      for (const each of userInfo.activity) {
         activityData.push(
            `_${each.status.charAt(0).toUpperCase() + each.status.slice(1)}_ ${
               each.progress || ""
            } [${each.title}](${each.siteUrl})`,
         );
      }
   }
   const activity = activityData.join("\n") || "N/A";

   const favouriteAnime: string[] = [];
   const favouriteManga: string[] = [];
   const favouriteCharacter: string[] = [];

   userInfo.favourites.anime.forEach((value) =>
      favouriteAnime.push(`[${value.name}](${value.url})`),
   );

   userInfo.favourites.manga.forEach((value) =>
      favouriteManga.push(`[${value.name}](${value.url})`),
   );

   userInfo.favourites.character.forEach((value) =>
      favouriteCharacter.push(`[${value.name}](${value.url})`),
   );

   const fields: EmbedFieldData[] = [];

   fields.push({
      name: "> General info:",
      value: textJoin([
         `**Followers** ↬ [${followers}](${userInfo.siteUrl}/social)`,
         `**Following** ↬ [${following}](${userInfo.siteUrl}/social)`,
         "",
         userInfo.mostViewAnimeGenre,
         userInfo.mostViewMangaGenre,
      ]),
   });

   if (favouriteAnime.length > 0) {
      fields.push({
         name: "> Favourite anime:",
         value: setFavText(favouriteAnime),
      });
   }

   if (favouriteManga.length > 0) {
      fields.push({
         name: "> Favourite manga:",
         value: setFavText(favouriteManga),
      });
   }

   if (favouriteCharacter.length > 0) {
      fields.push({
         name: "> Favourite character:",
         value: setFavText(favouriteCharacter),
      });
   }

   fields.push({
      name: "> Latest activity:",
      value: activity,
   });

   const embed = new MessageEmbed()
      .setTitle(`${userInfo.name} profile`)
      .setImage(`https://img.anili.st/user/${authId}`)
      .setURL(userInfo.siteUrl)
      .addFields(fields);

   return embed;

   //__</EmbedData>
}

async function profileUserData(authId: string) {
   const promiseData = await Promise.allSettled([
      getViewer(authId),
      getFollower(authId),
      getFollowing(authId),
      getActivity(authId),
   ]);


   const catchReason = (text: any) => {
      catchNewError(text);
      return "N/A";
   };

   const viewer =
      promiseData[0].status === "fulfilled"
         ? promiseData[0].value
         : new Error(promiseData[0].reason);

   const followers =
      promiseData[1].status === "fulfilled"
         ? promiseData[1].value
         : catchReason(promiseData[1].reason);
   const following =
      promiseData[2].status === "fulfilled"
         ? promiseData[2].value
         : catchReason(promiseData[2].reason);

   const activity =
      promiseData[3].status === "fulfilled"
         ? promiseData[3].value
         : catchReason(promiseData[3].reason);

   if (viewer instanceof Error) throw viewer;

   const activityData = [];

   if (typeof activity !== "string") {
      for (const each of activity) {
         activityData.push({
            cratedAt: each.createdAt,
            status: each.status,
            progress: each.progress,
            title: each.media.title.english || each.media.title.romaji,
            siteUrl: each.media.siteUrl,
         });
      }
   }

   const profileUserInfo: ProfileUserInfo = {
      name: viewer.name,
      siteUrl: viewer.siteUrl,
      avatar: viewer.avatar,
      banner: viewer.banner || "https://i.imgur.com/WD2OJl2.png",
      profileColor: viewer.profileColor,
      followers,
      following,
      mostViewAnimeGenre: `**Most view [anime](${viewer.siteUrl}/stats/anime/genres) genre** ↬ \`${viewer.mostViewGenres.anime.genre}\` (__${viewer.mostViewGenres.anime.count}__ entries)`,
      mostViewMangaGenre: `**Most view [manga](${viewer.siteUrl}/stats/manga/genres) genre** ↬ \`${viewer.mostViewGenres.manga.genre}\` (__${viewer.mostViewGenres.manga.count}__ entries)`,
      activity: activityData,
      favourites: viewer.favourites,
      anime: viewer.statistics.anime,
      manga: viewer.statistics.manga,
   };

   return profileUserInfo;
}

function setFavText(arr: string[]) {
   const final = [];
   let group = [];
   let i = 0;

   for (const each of arr) {
      if (i < 3) {
         group.push(each);
         i++;
      } else {
         final.push(group.join(" · "));

         group = [];
         group.push(each);

         i = 0;
         i++;
      }
   }
   if (group.length > 0) final.push(group.join(" · "));

   return final.join("\n");
}

export interface ProfileUserInfo {
   name: string;
   siteUrl: string;
   avatar: string;
   banner: string;
   profileColor: string;
   followers: number | string;
   following: number | string;
   mostViewAnimeGenre: string;
   mostViewMangaGenre: string;
   favourites: {
      anime: FavouriteData[];
      manga: FavouriteData[];
      character: FavouriteData[];
   };
   activity: {
      cratedAt: number;
      status: string;
      progress: string;
      title: string;
      siteUrl: string;
   }[];
   anime: {
      count: number;
      episodesWatched: number;
      meanScore: number;
   };
   manga: {
      count: number;
      chaptersRead?: number;
      meanScore: number;
   };
}
