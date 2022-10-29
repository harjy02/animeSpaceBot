import fetch, { RequestInit } from "node-fetch";

export async function getStudioIndex(key: string, perPage: number) {
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

   const studioArr: StudioIndexData[] = [];

   for (const each of fetchData.data.Page.studios) {
      studioArr.push({
         name: each.name,
         id: each.id,
      });
   }

   if (studioArr.length === 0) return null;

   return studioArr;
}

export interface StudioIndexData {
   name: string;
   id: number;
}

interface Query {
   data: {
      Page: {
         studios: {
            id: number;
            name: string;
         }[];
      };
   };
}

const query = /* GraphQL */ `
   query ($search: String, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
         studios(search: $search) {
            id
            name
         }
      }
   }
`;
