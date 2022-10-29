import type { MediaData } from "typings/commands/media";
import { MessageEmbed } from "discord.js";
import { getMangaData } from "../../utils/mangaSearch/mangaData";
import { parseDescription } from "lib/tools/other/parseDescription";

export async function mangaDescription(idAl: number, idMal: number): Promise<MediaData> {
   const promiseData = await Promise.allSettled([getMangaData(idAl)]);

   const manga =
      promiseData[0].status === "fulfilled"
         ? promiseData[0].value
         : new Error(promiseData[0].reason);

   if (manga instanceof Error) throw manga;

   const descriptionArray = [];
   const descriptionData = parseDescription(manga.description, 1700);
   descriptionArray.push(descriptionData.description);
   if (descriptionData.limitReached)
      descriptionArray.push(`[Read full description...](${manga.siteUrl})`);

   const embed = new MessageEmbed()
      .setColor(manga.color)
      .setTitle(manga.title)
      .setURL(manga.siteUrl)
      .setImage(manga.bannerImage)
      .setDescription(descriptionArray.join("\n"))
      .setTimestamp(new Date());

   return { embed, mediaTitle: manga.title, identifier: { idMal, idAl } };
}
