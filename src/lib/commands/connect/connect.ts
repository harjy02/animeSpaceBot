import fetch, { RequestInit } from "node-fetch";

import type { DeepNullable } from "typings/other/deepNullable";

export async function getAlUserInfo(user: string) {
   const id = parseInt(user);

   let body;
   if (isNaN(id)) {
      //username
      body = {
         query: usernameQuery,
         variables: { username: user },
      };
   } else {
      //id
      body = {
         query: idQUery,
         variables: { id },
      };
   }

   const requestInit: RequestInit = {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "Accept": "application/json",
      },
      body: JSON.stringify(body),
   };

   const fetchData = await fetch("https://graphql.anilist.co", requestInit)
      .then(async (response) => {
         const result = await response.text();

         if (response.statusText.includes("Not Found") && response.status === 404)
            return "n/a";

         if (!response.ok) {
            throw new Error(result);
         } else {
            const json = await JSON.parse(result);
            if (!json.data || !json.data.User) return "n/a";
            return json as DeepNullable<Query>;
         }
      })
      .catch((error) => {
         throw error;
      });

   if (fetchData === "n/a") return "n/a";

   const data = fetchData.data?.User;

   const returnData: ReturnQuery = {
      name: data?.name || "N/A",
      id: data?.id || 0,
      siteUrl: data?.siteUrl || "N/A",
      avatar: {
         large: data?.avatar?.large || "N/A",
      },
   };

   return returnData;
}

interface ReturnQuery {
   name: string;
   id: number;
   siteUrl: string;
   avatar: {
      large: string;
   };
}
interface Query {
   data: {
      User: {
         name: string;
         id: number;
         siteUrl: string;
         avatar: {
            large: string;
         };
      };
   };
}

const usernameQuery = /* GraphQL */ `
   query ($username: String) {
      User(name: $username) {
         name
         id
         siteUrl
         avatar {
            large
         }
      }
   }
`;

const idQUery = /* GraphQL */ `
   query ($id: Int) {
      User(id: $id) {
         name
         id
         siteUrl
         avatar {
            large
         }
      }
   }
`;
