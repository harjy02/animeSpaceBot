import { MessageEmbed } from "discord.js";
import { AnimeObject, getAnimeData } from "../mediaSearch/utils/animeSearch/animeData";
import { AnimeThemeData, getAnimeThemeData } from "./animeThemeData";

export class AnimeEndingCollection {
   private animeThemeData: Promise<AnimeThemeData>;
   private animeData: Promise<AnimeObject>;
   private idMal: number;

   constructor(idMal: number) {
      this.animeThemeData = getAnimeThemeData(idMal);
      this.animeData = getAnimeData(idMal);
      this.idMal = idMal;
   }

   public async getEnding(page: number) {
      const animeThemeData = await this.animeThemeData;
      const animeData = await this.animeData;

      if (animeThemeData.ed.length <= 0) {
         return {
            nullContent: true,
            hasNext: false,
            description: `No Ending were found for the anime ${animeData.title}`,
         } as EndingReturn;
      }

      const hasNext = animeThemeData.ed.length > page;
      const ed = animeThemeData.ed[page - 1];
      const url = "https://v.animethemes.moe/" + ed.url.split("/").pop();

      return {
         hasNext,
         description: [
            `> **Anime** ↬ \`${animeData.title}\``,
            `> **Ending title** ↬ \`${ed.name}\``,
            `> **Ending N°** ↬ \`${ed.id}\``,
            `> **External links:** [Themese.moe](<https://themes.moe/list/anime/${this.idMal}>) • [MediaUrl:](${url})`,
         ].join("\n"),
      } as EndingReturn;
   }

   public async getEndingList() {
      const animeThemeData = await this.animeThemeData;
      const animeData = await this.animeData;

      const embed = new MessageEmbed()
         .setThumbnail(animeData.thumbnail)
         .setTitle(`${animeData.title} Endings:`)
         .setURL(animeData.siteUrl)
         .setDescription(
            [
               ...animeThemeData.ed.map((ed) => `ED${ed.id}) [${ed.name}](${ed.url})`),
            ].join("\n"),
         );

      return embed;
   }
}

interface EndingReturn {
   nullContent?: boolean;
   hasNext: boolean;
   description: string;
}
