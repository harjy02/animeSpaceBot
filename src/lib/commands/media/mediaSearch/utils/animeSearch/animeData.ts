import fetch, { RequestInit } from "node-fetch";

import type { ColorResolvable } from "discord.js";
import type { DeepNullable } from "typings/other/deepNullable";
import { parseMs } from "lib/tools/other/parseMs";
import { reply } from "assets/emoji";

export async function getAnimeData(idMal: number) {
   const requestInit: RequestInit = {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "Accept": "application/json",
      },
      body: JSON.stringify({
         query,
         variables: { idMal },
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

   const data = fetchData?.data?.Media;

   const externalLinks: string[] = [];
   if (data?.externalLinks) {
      for (const link of data.externalLinks) {
         externalLinks.push(
            `[${link?.site || "N/A"}](${link?.url || "https://example.com/"})`,
         );
      }
   }

   const airingIn = data?.nextAiringEpisode?.timeUntilAiring
      ? parseMs(data.nextAiringEpisode?.timeUntilAiring * 1000)
      : undefined;

   const anime: AnimeObject = {
      color: (data?.coverImage?.color as ColorResolvable) || "DEFAULT",
      title: data?.title?.english || data?.title?.romaji || data?.title?.native || "N/A",
      siteUrl: data?.siteUrl || "",
      thumbnail: data?.coverImage?.large || "",
      bannerImage: data?.bannerImage || "",

      mediaImage: `https://img.anili.st/media/${data?.id}`,
      description: data?.description || "No description",

      // schematic info

      episodes: `${
         data?.episodes === undefined ||
         data.status === "RELEASING" ||
         data?.nextAiringEpisode?.episode
            ? `**Next releasing ep** ↬ \`${data?.nextAiringEpisode?.episode || "N/A"}${
                 data?.episodes ? ` (of ${data.episodes})` : ""
              }\`\n${
                 data?.nextAiringEpisode?.episode
                    ? `${reply.emoji}**Airing in** ↬ \`${airingIn || "N/A"}\``
                    : ""
              }`
            : `**Total ep** ↬ \`${data.episodes || "N/A"}\``
      }`,

      duration: `**Duration** ↬ \`${!data?.duration ? "N/A" : `${data.duration} min`}\``,

      status: `**Status** ↬ \`${data?.status || "N/A"}\``,
      format: `**Format** ↬ \`${data?.format || "N/A"}\``,

      score: `**Score** ↬ \`${data?.averageScore || "N/A"}\``,

      externalLinks: `**External links** ↬ ${
         externalLinks.slice(0, 3).join(" • ") || "`N/A`"
      }`,
   };

   return anime;
}

export interface AnimeObject {
   color: ColorResolvable;
   title: string;
   siteUrl: string;
   thumbnail: string;
   bannerImage: string;
   mediaImage: string;
   description: string;
   episodes: string;
   duration: string;
   status: string;
   format: string;
   score: string;
   externalLinks: string;
}

interface Query {
   data: {
      Media: {
         nextAiringEpisode: {
            timeUntilAiring: number;
            episode: number;
         };
         title: {
            romaji: string;
            english: string;
            native: string;
         };
         startDate: {
            year: number;
            month: number;
            day: number;
         };
         endDate: {
            year: number;
            month: number;
            day: number;
         };
         coverImage: {
            large: string;
            color: ColorResolvable;
         };
         externalLinks: {
            url: string;
            site: string;
         }[];
         id: string;
         idMal: number;
         duration: number;
         bannerImage: string;
         format: string;
         genres: string[];
         status: string;
         episodes: number;
         description: string;
         siteUrl: string;
         averageScore: number;
         meanScore: number;
      };
   };
}

//TODO change query input to idAl

const query = /* GraphQL */ `
   query ($idMal: Int) {
      Media(idMal: $idMal, type: ANIME) {
         nextAiringEpisode {
            timeUntilAiring
            episode
         }
         title {
            romaji
            english
            native
         }
         startDate {
            year
            month
            day
         }
         endDate {
            year
            month
            day
         }
         coverImage {
            large
            color
         }
         externalLinks {
            url
            site
         }
         id
         idMal
         duration
         bannerImage
         format
         genres
         status
         episodes
         description
         siteUrl
         averageScore
         meanScore
      }
   }
`;
