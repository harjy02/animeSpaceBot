import { ColorResolvable, MessageEmbed } from "discord.js";

import type { CharacterData } from "typings/commands/media";
import type { DeepNullable } from "typings/other/deepNullable";
import fetch from "node-fetch";
import { parseDescription } from "lib/tools/other/parseDescription";

type CharacterName = string;
type CharacterId = number;

export async function characterLongDescription(
   identifier: CharacterName | CharacterId,
): Promise<CharacterData | null> {
   const query = queryInit(identifier);

   const options = {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "Accept": "application/json",
      },
      body: JSON.stringify({
         query,
      }),
   };

   const character = await fetch("https://graphql.anilist.co", options)
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

   if (!character.data || !character.data.Character) return null;

   const data = character.data.Character;

   //__<other_info>
   const textData = [];

   //__</other_info>

   //__<description_data>

   const descriptionData = parseDescription(
      data.description || "No description available",
      1800,
   );

   textData.push(descriptionData.description);
   if (descriptionData.limitReached)
      textData.push(`[Read full description...](${data.siteUrl})`);

   /*
   const mainAnimeTitles = [];
   if (data?.media?.nodes) {
      for (const title of data.media.nodes) {
         mainAnimeTitles.push(
            `• [${title?.title?.romaji || "N/A"}](${title?.siteUrl || "N/A"})`,
         );
         if (mainAnimeTitles.length > 3) break;
      }
   }
   */
   //__</description_data>

   const embed = new MessageEmbed()
      .setColor(
         (data.media?.nodes?.[0]?.coverImage?.color as ColorResolvable) || "DEFAULT",
      )
      .setTitle(data.name?.full || "N/A")
      .setURL(data.siteUrl || "N/A")
      .setThumbnail(data.image?.large || "N/A")
      .setDescription(textData.join("\n"))
      .setTimestamp();

   return {
      embed,
      identifier: {
         name: data.name?.full!,
         id: data.id!,
      },
   } as CharacterData;
}

interface Query {
   data: {
      Character: {
         id: number;
         gender: string;
         age: string;
         bloodType: string;
         dateOfBirth: {
            month: number;
            day: number;
         };
         name: {
            full: string;
         };
         image: {
            large: string;
         };
         description: string;
         siteUrl: string;
         media: {
            nodes: {
               title: {
                  english: string;
                  romaji: string;
               };
               coverImage: {
                  color: ColorResolvable;
               };
               siteUrl: string;
            }[];
         };
      };
   };
}

function queryInit(identifier: CharacterName | CharacterId) {
   if (typeof identifier === "number") {
      return /* GraphQL */ `
       {
         Character(id: ${identifier}) {
            id
            gender
            age
            bloodType
            dateOfBirth {
               month
               day
            }
            name {
               full
            }
            image {
               large
            }
            description
            siteUrl
            media(page: 1, perPage: 5, sort: POPULARITY_DESC) {
               nodes {
                  title {
                     english
                     romaji
                  }
                  coverImage {
                     color
                  }
                  siteUrl
               }
            }
         }
      }
   `;
   } else {
      return /* GraphQL */ `
       {
         Character(search: "${identifier}") {
            id
            gender
            age
            bloodType
            dateOfBirth {
               month
               day
            }
            name {
               full
            }
            image {
               large
            }
            description
            siteUrl
            media(page: 1, perPage: 5, sort: POPULARITY_DESC) {
               nodes {
                  title {
                     english
                     romaji
                  }
                  coverImage {
                     color
                  }
                  siteUrl
               }
            }
         }
      }
   `;
   }
}
