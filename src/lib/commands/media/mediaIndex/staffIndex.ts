import fetch, { RequestInit } from "node-fetch";

export async function getStaffIndex(key: string, perPage: number) {
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

   const staffArr: StaffIndexData[] = [];

   for (const each of fetchData.data.Page.staff) {
      staffArr.push({
         name: {
            full: each.name.full,
         },
         id: each.id,
      });
   }

   if (staffArr.length === 0) return null;

   return staffArr;
}

export interface StaffIndexData {
   name: {
      full: string;
   };
   id: number;
}

interface Query {
   data: {
      Page: {
         staff: {
            id: number;
            name: {
               full: string;
            };
         }[];
      };
   };
}

const query = /* GraphQL */ `
   query ($search: String, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
         staff(search: $search) {
            id
            name {
               full
            }
         }
      }
   }
`;
