import fetch, { RequestInit } from "node-fetch";

import type { ColorResolvable } from "discord.js";
import type { DeepNullable } from "typings/other/deepNullable";
import { getMonth } from "lib/tools/other/getMonth";

export async function getMangaData(idAl: number) {
   const requestInit: RequestInit = {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "Accept": "application/json",
      },
      body: JSON.stringify({
         query,
         variables: { idAl },
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
      for (const link of data.externalLinks)
         externalLinks.push(`[${link?.site || "N/A"}](${link?.url || "N/A"})`);
   }

   const manga: MangaObject = {
      // general info
      color: (data?.coverImage?.color as ColorResolvable) || "DEFAULT",
      title: data?.title?.english || data?.title?.romaji || "N/A",
      siteUrl: data?.siteUrl || "",

      thumbnail: data?.coverImage?.large || "",
      bannerImage: data?.bannerImage || "",

      mediaImage: `https://img.anili.st/media/${data?.id}`,
      description: data?.description || "No description",

      // schematic info

      startDate: `**Start** ↬ \`${
         data?.startDate?.month
            ? `${getMonth(data.startDate.month)}-${data.startDate.year}`
            : "N/A"
      }\``,

      status: `**Status** ↬ \`${data?.status || "N/A"}\``,
      format: `**Format** ↬ \`${data?.format || "N/A"}\``,

      score: `**Score** ↬ \`${data?.averageScore || "N/A"}\``,

      chapters: `**chapters** ↬ \`${data?.chapters || "N/A"}\``,
      volumes: `**Volumes** ↬ \`${data?.volumes || "N/A"}\``,

      externalLinks: `**External links** ↬ ${
         externalLinks.slice(0, 3).join(" • ") || "`N/A`"
      }`,
   };

   return manga;
}

interface MangaObject {
   color: ColorResolvable;
   title: string;
   siteUrl: string;
   thumbnail: string;
   bannerImage: string;
   mediaImage: string;
   description: string;
   startDate: string;
   status: string;
   format: string;
   score: string;
   chapters: string;
   volumes: string;
   externalLinks: string;
}

interface Query {
   data: {
      Media: {
         title: {
            romaji: string;
            english: string;
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
         bannerImage: string;
         format: string;
         genres: string[];
         status: string;
         description: string;
         siteUrl: string;
         averageScore: number;
         chapters: number;
         volumes: number;
      };
   };
}

const query = /* GraphQL */ `
   query ($idAl: Int) {
      Media(id: $idAl, type: MANGA) {
         title {
            english
            romaji
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
         bannerImage
         format
         genres
         status
         description
         siteUrl
         averageScore
         chapters
         volumes
      }
   }
`;
