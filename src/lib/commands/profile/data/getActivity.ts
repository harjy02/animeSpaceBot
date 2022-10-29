import fetch from "node-fetch";

export async function getActivity(authId: string) {
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
            return json.data.Page.activities as AnilistQuery[];
         }
      })
      .catch((error) => {
         throw error;
      });

   return data;
}

interface AnilistQuery {
   createdAt: number;
   status: string;
   progress: string;
   media: {
      title: {
         romaji: string;
         english: string;
      };
      siteUrl: string;
   };
}

const anilistQuery = /* GraphQL */ `
   query ($userId: Int) {
      Page(page: 1, perPage: 3) {
         activities(userId: $userId, sort: ID_DESC, type: MEDIA_LIST) {
            __typename
            ... on ListActivity {
               createdAt
               status
               progress
               media {
                  title {
                     romaji
                     english
                  }
                  siteUrl
               }
            }
         }
      }
   }
`;
