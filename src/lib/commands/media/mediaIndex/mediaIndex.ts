import type { MediaFormat, MediaType } from "typings/anilist/media";
import fetch, { RequestInit } from "node-fetch";

export async function getMediaIndex(
   search: string,
   perPage: number,
   mediaType: MediaType,
   mediaFormat?: MediaFormat,
) {
   const query = mediaFormat ? formatQuery(mediaFormat) : typeQuery(mediaType);

   const requestInit: RequestInit = {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "Accept": "application/json",
      },
      body: JSON.stringify({
         query,
         variables: { search, perPage },
      }),
   };

   const fetchData = await fetch("https://graphql.anilist.co", requestInit)
      .then(async (response) => {
         const result = await response.text();
         if (!response.ok) {
            throw new Error(result);
         } else {
            const json = await JSON.parse(result);
            return json as Query;
         }
      })
      .catch((error) => {
         throw error;
      });

   const mediaArr: MediaIndexData[] = [];

   for (const each of fetchData.data.Page.media) {
      mediaArr.push({
         idAl: each.id,
         idMal: each.idMal,
         title: each.title.english || each.title.romaji || "N/A",
         isAdult: each.isAdult,
         format: each.format,
      });
   }

   if (mediaArr.length === 0) return null;

   return mediaArr;
}

export interface MediaIndexData {
   idAl: number;
   idMal: number;
   title: string;
   isAdult: boolean;
   format: string;
}

interface Query {
   data: {
      Page: {
         media: {
            id: number;
            idMal: number;
            title: {
               romaji: string;
               english: string;
            };
            isAdult: boolean;
            format: string;
         }[];
      };
   };
}

function typeQuery(mediaType: MediaType) {
   return /* GraphQL */ `
   query ($search: String, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
         media(search: $search, type: ${mediaType}) {
            id
            idMal
            title {
               romaji
               english
            }
            isAdult
            format
         }
      }
   }
`;
}

function formatQuery(mediaFormat: MediaFormat) {
   return /* GraphQL */ `
   query ($search: String, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
         media(search: $search, format: ${mediaFormat}) {
            id
            idMal
            title {
               romaji
               english
            }
            isAdult
            format
         }
      }
   }
`;
}
