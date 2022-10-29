import fetch from "node-fetch";

export async function getFollowing(authId: string) {

   const anilistOptions = {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "Accept": "application/json",
      },
      body: JSON.stringify({
         query: anilistQuery,
         variables: { userId: authId },
      }),
   };

   const data = await fetch("https://graphql.anilist.co", anilistOptions)
      .then(async (response) => {
         const result = await response.text();
         if (!response.ok) {
            throw new Error(result);
         } else {
            const json = await JSON.parse(result);
            return json.data.Page as AnilistQuery;
         }
      })
      .catch((error) => {
         throw error;
      });

   return data.pageInfo.total;
}

interface AnilistQuery {
   pageInfo: {
      total: number;
   };
   following: {
      name: string;
   }[];
}

const anilistQuery = /* GraphQL */ `
   query ($userId: Int!) {
      Page(page: 1) {
         pageInfo {
            total
         }
         following(userId: $userId) {
            name
         }
      }
   }
`;
