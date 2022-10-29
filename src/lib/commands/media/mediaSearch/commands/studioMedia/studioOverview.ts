import { ColorResolvable, MessageEmbed } from "discord.js";

import type { DeepNullable } from "typings/other/deepNullable";
import fetch from "node-fetch";
import { textInline } from "lib/tools/text/textInline";

type StudioName = string;
type StudioId = number;

export async function studioOverview(identifier: StudioName | StudioId) {
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

   const studio = await fetch("https://graphql.anilist.co", options)
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

   if (!studio.data || !studio.data.Studio) return null;

   const data = studio.data.Studio;

   //__<description_data>

   const description: string[] = [];

   description.push(`Favourite by: \`${data.favourites} people\``);
   description.push("");
   description.push("**Latest years Media production:**");

   let year = data.media?.nodes?.[0]?.startDate?.year;
   let currentNodeYear: string[] = [];

   if (data.media?.nodes) {
      for (const node of data.media.nodes) {
         if (year === node?.startDate?.year) {
            currentNodeYear.push(
               textInline([
                  [
                     {
                        step: `_\`${node?.format?.toLowerCase()}\`_`,
                        spacing: 11,
                     },
                     {
                        step: ` [${
                           node?.title?.english || node?.title?.romaji || "N/A"
                        }](${node?.siteUrl || "N/A"})`,
                        spacing: 0,
                     },
                  ],
               ]),
            );
         } else {
            const currentYear: string[] = [];

            currentYear.push(`> **${String(year || "TBA")}**`);
            currentYear.push(...currentNodeYear);

            year = node?.startDate?.year;
            currentNodeYear = [];

            currentNodeYear.push(
               textInline([
                  [
                     {
                        step: `_\`${node?.format?.toLowerCase()}\`_`,
                        spacing: 11,
                     },
                     {
                        step: ` [${
                           node?.title?.english || node?.title?.romaji || "N/A"
                        }](${node?.siteUrl || "N/A"})`,
                        spacing: 0,
                     },
                  ],
               ]),
            );

            const currentYearText = currentYear.join("\n");
            const currentDescriptionText = description.join("\n");

            if (currentDescriptionText.length + currentYearText.length < 2047)
               description.push(currentYearText);
            else break;
         }
      }
   }

   //__</description_data>

   const studioEmbed = new MessageEmbed()
      .setColor(
         (data.media?.nodes?.[0]?.coverImage?.color as ColorResolvable) || "DEFAULT",
      )
      .setTitle(data.name || "N/A")
      .setURL(data.siteUrl || "N/A")
      .setDescription(description.join("\n"))
      .setTimestamp();

   return studioEmbed;
}

interface Query {
   data: {
      Studio: {
         name: string;
         favourites: number;
         isAnimationStudio: boolean;
         siteUrl: string;
         media: {
            nodes: {
               title: {
                  english: string;
                  romaji: string;
               };
               startDate: {
                  year: string;
               };
               coverImage: {
                  color: ColorResolvable;
               };
               siteUrl: string;
               format: string;
            }[];
         };
      };
   };
}

function queryInit(identifier: StudioName | StudioId) {
   if (typeof identifier === "number") {
      return /* GraphQL */ `
         {
            Studio(id: ${identifier}) {
               name
               favourites
               isAnimationStudio
               siteUrl
               media(sort: START_DATE_DESC, isMain: true) {
                  nodes {
                     title {
                        english
                        romaji
                     }
                     startDate {
                        year
                     }
                     coverImage {
                        color
                     }
                     siteUrl
                     format
                  }
               }
            }
         }
      `;
   } else {
      return /* GraphQL */ `
         {
            Studio(search: "${identifier}") {
               name
               favourites
               isAnimationStudio
               siteUrl
               media(sort: START_DATE_DESC, isMain: true) {
                  nodes {
                     title {
                        english
                        romaji
                     }
                     startDate {
                        year
                     }
                     coverImage {
                        color
                     }
                     siteUrl
                     format
                  }
               }
            }
         }
      `;
   }
}
