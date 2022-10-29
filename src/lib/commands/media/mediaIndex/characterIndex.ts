import fetch, { RequestInit } from "node-fetch";

export async function getCharacterIndex(key: string, perPage: number) {
   const requestInit: RequestInit = {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "Accept": "application/json",
      },
      body: JSON.stringify({
         query,
         variables: { search: key, perPage },
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

   const characterArr: CharacterIndexData[] = [];

   for (const each of fetchData.data.Page.characters) {
      characterArr.push({
         name: each.name.full,
         id: each.id,
         title:
            each.media.nodes[0].title.english ||
            each.media.nodes[0].title.romaji ||
            "N/A",
      });
   }

   if (characterArr.length === 0) return null;

   return characterArr;
}

export interface CharacterIndexData {
   name: string;
   id: number;
   title: string;
}

interface Query {
   data: {
      Page: {
         characters: {
            name: {
               full: string;
            };
            id: number;
            media: {
               nodes: {
                  title: {
                     english: string;
                     romaji: string;
                  };
               }[];
            };
         }[];
      };
   };
}

const query = /* GraphQL */ `
   query ($search: String, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
         characters(search: $search) {
            name {
               full
            }
            id
            media(sort: POPULARITY_DESC, perPage: 1) {
               nodes {
                  title {
                     english
                     romaji
                  }
               }
            }
         }
      }
   }
`;
