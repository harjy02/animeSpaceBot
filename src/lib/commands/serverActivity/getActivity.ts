import { comment, heartFilled } from "assets/emoji";
import { ColorResolvable, MessageEmbed } from "discord.js";
import type { DeepNullable } from "typings/other/deepNullable";
import fetch, { RequestInit } from "node-fetch";

export async function getActivity(userId: string[], page: number, greaterThan?: number) {
   const requestInit: RequestInit = {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "Accept": "application/json",
      },
      body: JSON.stringify({
         query,
         variables: {
            userId,
            page,
            greaterThan: greaterThan || 0,
         },
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

   if (fetchData.data?.Page?.activities) {
      const activitiesEmbed = fetchData.data.Page.activities.map((each) => {
         const embed = new MessageEmbed()
            .setColor((each?.media?.coverImage?.color as ColorResolvable) || "DEFAULT")
            .setAuthor({
               name: each?.user?.name || "",
               iconURL: each?.user?.avatar?.large || "",
               url: each?.user?.siteUrl || "",
            })
            .setDescription(
               [
                  `> **[${
                     each?.media?.title?.english || each?.media?.title?.romaji || "N/A"
                  }](${each?.media?.siteUrl || ""})**`,
                  `${each?.createdAt ? `<t:${each?.createdAt}:R> **|**` : ""} ${
                     each?.likeCount
                  } ${heartFilled.emoji} ${each?.replyCount} ${comment.emoji}`,
                  "",
                  `**${each?.status || "N/A"}** ${
                     each?.progress ? `↬ \`${each?.progress}\`` : ""
                  }`,
               ].join("\n"),
            );

         if (each?.media?.coverImage?.large)
            embed.setThumbnail(each?.media?.coverImage?.large);

         return embed;
      });

      return activitiesEmbed.reverse();
   } else {
      return [];
   }
}

const query = /* GraphQL */ `
   query ($userId: [Int], $page: Int, $greaterThan: Int) {
      Page(page: $page, perPage: 50) {
         activities(
            type: MEDIA_LIST
            userId_in: $userId
            sort: ID_DESC
            createdAt_greater: $greaterThan
         ) {
            ... on ListActivity {
               media {
                  title {
                     romaji
                     english
                  }
                  coverImage {
                     large
                     color
                  }
                  siteUrl
               }
               user {
                  name
                  siteUrl
                  avatar {
                     large
                  }
               }
               createdAt
               status
               likeCount
               replyCount
               progress
            }
         }
      }
   }
`;

export interface Query {
   data: {
      Page: {
         activities: {
            media: {
               title: {
                  romaji: string;
                  english: string;
               };
               coverImage: {
                  large: string;
                  color: string;
               };
               siteUrl: string;
            };
            user: {
               name: string;
               siteUrl: string;
               avatar: {
                  large: string;
               };
            };
            createdAt: number;
            status: string;
            likeCount: number;
            replyCount: number;
            progress: string;
         }[];
      };
   };
}
