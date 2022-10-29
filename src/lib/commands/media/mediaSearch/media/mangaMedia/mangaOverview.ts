import { catchNewError } from "lib/errors/errorHandling";
import type { MediaData } from "typings/commands/media";
import { MessageEmbed } from "discord.js";
import { getMangaData } from "../../utils/mangaSearch/mangaData";
import { getMediaUserInfo } from "../../utils/mediaUserInfo/getMediaUserInfo";
import { textInline } from "lib/tools/text/textInline";

export async function mangaOverview(
   discordGuildId: string,
   discordUserId: string,
   idAl: number,
   idMal: number,
): Promise<MediaData> {
   const promiseData = await Promise.allSettled([
      getMangaData(idAl),
      getMediaUserInfo(discordGuildId, discordUserId, idAl, "MANGA"),
   ]);

   const catchResponse = (text: any) => {
      catchNewError(text);
      return "There was some problem retrieving the data";
   };

   const manga =
      promiseData[0].status === "fulfilled"
         ? promiseData[0].value
         : new Error(promiseData[0].reason);

   const userStatus =
      promiseData[1].status === "fulfilled"
         ? promiseData[1].value
         : {
              isInList: false,
              description: catchResponse(promiseData[1].reason),
           };

   if (manga instanceof Error) throw manga;

   const embed = new MessageEmbed()
      .setColor(manga.color)
      .setTitle(manga.title)
      .setURL(manga.siteUrl)
      .setImage(manga.mediaImage)
      .addFields(
         {
            name: "> Info",
            value: textInline([
               [
                  {
                     step: manga.format,
                     spacing: 28,
                  },
                  {
                     step: manga.startDate,
                     spacing: 0,
                  },
               ],
               [
                  {
                     step: manga.status,
                     spacing: 29,
                  },
                  {
                     step: manga.score,
                     spacing: 0,
                  },
               ],
               [
                  {
                     step: manga.chapters,
                     spacing: 0,
                  },
               ],
               [
                  {
                     step: manga.volumes,
                     spacing: 0,
                  },
               ],
               [],
               [
                  {
                     step: manga.externalLinks,
                     spacing: 0,
                  },
               ],
               [
                  {
                     step: `**Open on** ↬ [Anilist](${manga.siteUrl}) • [MyAnimeList](https://myanimelist.net/manga/${idMal})`,
                     spacing: 0,
                  },
               ],
            ]),
         },
         {
            name: "> User status",
            value: userStatus.description,
            inline: false,
         },
      )
      .setTimestamp(new Date());

   return { embed, mediaTitle: manga.title, identifier: { idMal, idAl } };
}
