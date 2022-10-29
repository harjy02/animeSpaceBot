import { MessageEmbed } from "discord.js";
import { AnimeObject, getAnimeData } from "../mediaSearch/utils/animeSearch/animeData";
import { AnimeThemeData, getAnimeThemeData } from "./animeThemeData";

export class AnimeOpeningCollection {
   private animeThemeData: Promise<AnimeThemeData>;
   private animeData: Promise<AnimeObject>;
   private idMal: number;

   constructor(idMal: number) {
      this.animeThemeData = getAnimeThemeData(idMal);
      this.animeData = getAnimeData(idMal);
      this.idMal = idMal;
   }

   public async getOpening(page: number) {
      const animeThemeData = await this.animeThemeData;
      const animeData = await this.animeData;

      if (animeThemeData.op.length <= 0) {
         return {
            nullContent: true,
            hasNext: false,
            description: `No opening were found for the anime ${animeData.title}`,
         } as OpeningReturn;
      }

      const hasNext = animeThemeData.op.length > page;
      const op = animeThemeData.op[page - 1];
      const url = "https://v.animethemes.moe/" + op.url.split("/").pop();

      return {
         hasNext,
         description: [
            `> **Anime** ↬ \`${animeData.title}\``,
            `> **Opening title** ↬ \`${op.name}\``,
            `> **Opening N°** ↬ \`${op.id}\``,
            `> **External links:** [Themese.moe](<https://themes.moe/list/anime/${this.idMal}>) • [MediaUrl:](${url})`,
         ].join("\n"),
      } as OpeningReturn;
   }

   public async getOpeningList() {
      const animeThemeData = await this.animeThemeData;
      const animeData = await this.animeData;

      const embed = new MessageEmbed()
         .setThumbnail(animeData.thumbnail)
         .setTitle(`${animeData.title} Openings:`)
         .setURL(animeData.siteUrl)
         .setDescription(
            [
               ...animeThemeData.op.map((op) => `OP${op.id}) [${op.name}](${op.url})`),
            ].join("\n"),
         );

      return embed;
   }
}

interface OpeningReturn {
   nullContent?: boolean;
   hasNext: boolean;
   description: string;
}
