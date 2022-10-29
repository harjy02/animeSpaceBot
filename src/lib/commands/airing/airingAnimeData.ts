import type { ColorResolvable } from "discord.js";
import fetch, { RequestInit } from "node-fetch";

export async function getAiringAnimeData(idAl: number) {
   const requestInit: RequestInit = {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "Accept": "application/json",
      },
      body: JSON.stringify({
         query: AnimeDataQuery,
         variables: { id: idAl },
      }),
   };

   const fetchData = await fetch("https://graphql.anilist.co", requestInit)
      .then(async (response) => {
         const result = await response.text();
         if (!response.ok) {
            throw new Error(result);
         } else {
            const json = await JSON.parse(result);
            return json as AiringAnimeData;
         }
      })
      .catch((error) => {
         throw error;
      });

   const { title, ...rest } = fetchData.data.Media;

   const airingData: GetAiringAnimeData = {
      title: title.english || title.romaji || "N/A",
      ...rest,
   };

   return airingData;
}

interface GetAiringAnimeData {
   idMal: number | null;
   id: number;
   title: string;
   nextAiringEpisode: {
      airingAt: number;
      episode: number;
   } | null;
   coverImage: {
      large: string | null;
      color: ColorResolvable | null;
   };
   siteUrl: string | null;
   status: string | null;
}

interface AiringAnimeData {
   data: {
      Media: {
         idMal: number | null;
         id: number;
         title: {
            english: string | null;
            romaji: string | null;
         };
         nextAiringEpisode: {
            airingAt: number;
            episode: number;
         } | null;
         coverImage: {
            large: string | null;
            color: ColorResolvable | null;
         };
         siteUrl: string | null;
         status: string | null;
      };
   };
}
const AnimeDataQuery = /* GraphQL */ `
   query ($id: Int) {
      Media(id: $id) {
         idMal
         id
         title {
            english
            romaji
         }
         nextAiringEpisode {
            airingAt
            episode
         }
         coverImage {
            large
            color
         }
         siteUrl
         status
      }
   }
`;
