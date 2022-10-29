import { catchNewError } from "lib/errors/errorHandling";
import type { MediaData } from "typings/commands/media";
import { MessageEmbed } from "discord.js";
import { getAnimeData } from "../utils/animeSearch/animeData";
import { getMediaUserInfo } from "../utils/mediaUserInfo/getMediaUserInfo";
import { getThemeData } from "../utils/animeSearch/themeData";
import { textInline } from "lib/tools/text/textInline";

export async function compactAnimeOverview(
   discordGuildId: string,
   discordUserId: string,
   idAl: number,
   idMal: number,
): Promise<MediaData> {
   const promiseData = await Promise.allSettled([
      getAnimeData(idMal),
      getThemeData(idMal),
      getMediaUserInfo(discordGuildId, discordUserId, idAl, "ANIME"),
   ]);

   const catchResponse = (text: any) => {
      catchNewError(text);
      return "There was some problem retrieving the data";
   };

   const anime =
      promiseData[0].status === "fulfilled"
         ? promiseData[0].value
         : new Error(promiseData[0].reason);

   const themes =
      promiseData[1].status === "fulfilled"
         ? promiseData[1].value
         : catchResponse(promiseData[1].reason);

   const userStatus =
      promiseData[2].status === "fulfilled"
         ? promiseData[2].value
         : {
              isInList: false,
              description: catchResponse(promiseData[2].reason),
           };

   if (anime instanceof Error) throw anime;

   const embed = new MessageEmbed()
      .setColor(anime.color)
      .setTitle(anime.title)
      .setURL(anime.siteUrl)
      .setImage(anime.bannerImage)
      .addFields(
         {
            name: "> Info",
            value: textInline([
               [
                  {
                     step: anime.format,
                     spacing: 28,
                  },
                  {
                     step: anime.duration,
                     spacing: 0,
                  },
               ],
               [
                  {
                     step: anime.episodes,
                     spacing: 29,
                  },
                  {
                     step: anime.score,
                     spacing: 0,
                  },
               ],
               [
                  {
                     step: anime.status,
                     spacing: 0,
                  },
               ],
               [],
               [
                  {
                     step: anime.externalLinks,
                     spacing: 0,
                  },
               ],
               [
                  {
                     step: `**Open on** ↬ [Anilist](${anime.siteUrl}) • [MyAnimeList](https://myanimelist.net/anime/${idMal})`,
                     spacing: 0,
                  },
               ],
            ]),
         },
         {
            name: "> Latest themes",
            value: themes,
         },
         {
            name: "> User status",
            value: userStatus.description,
            inline: false,
         },
      )
      .setTimestamp(new Date());

   return { embed, mediaTitle: anime.title, identifier: { idAl, idMal } };
}
