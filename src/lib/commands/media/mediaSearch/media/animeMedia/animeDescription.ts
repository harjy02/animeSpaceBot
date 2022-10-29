import type { MediaData } from "typings/commands/media";
import { MessageEmbed } from "discord.js";
import { getAnimeData } from "../../utils/animeSearch/animeData";
import { parseDescription } from "lib/tools/other/parseDescription";

export async function animeDescription(idAl: number, idMal: number): Promise<MediaData> {
   const promiseData = await Promise.allSettled([getAnimeData(idMal)]);

   const anime =
      promiseData[0].status === "fulfilled"
         ? promiseData[0].value
         : new Error(promiseData[0].reason);

   if (anime instanceof Error) throw anime;

   const descriptionArray = [];
   const descriptionData = parseDescription(anime.description, 1700);
   descriptionArray.push(descriptionData.description);
   if (descriptionData.limitReached)
      descriptionArray.push(`[Read full description...](${anime.siteUrl})`);

   const embed = new MessageEmbed()
      .setColor(anime.color)
      .setTitle(anime.title)
      .setURL(anime.siteUrl)
      .setImage(anime.bannerImage)
      .setDescription(descriptionArray.join("\n"))
      .setTimestamp(new Date());

   return { embed, mediaTitle: anime.title, identifier: { idMal, idAl } };
}
