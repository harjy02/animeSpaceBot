import fetch, { RequestInit } from "node-fetch";

export async function getUserIndex(key: string, perPage: number) {
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

   const userArr: UserIndexData[] = [];

   for (const each of fetchData.data.Page.users) {
      userArr.push({
         name: each.name,
         id: each.id,
      });
   }

   if (userArr.length === 0) return null;

   return userArr;
}

export interface UserIndexData {
   name: string;
   id: number;
}

interface Query {
   data: {
      Page: {
         users: {
            id: number;
            name: string;
         }[];
      };
   };
}

const query = /* GraphQL */ `
   query ($search: String, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
         users(search: $search) {
            id
            name
         }
      }
   }
`;
