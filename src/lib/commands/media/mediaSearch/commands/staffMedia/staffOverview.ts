import type { DeepNullable } from "typings/other/deepNullable";
import { MessageEmbed } from "discord.js";
import fetch from "node-fetch";
import { getMonth } from "lib/tools/other/getMonth";

type StaffName = string;
type StaffId = number;

export async function staffOverview(identifier: StaffName | StaffId) {
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

   const staff = await fetch("https://graphql.anilist.co", options)
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

   if (!staff.data || !staff.data.Staff) return null;

   const data = staff.data.Staff;

   //__<other_info>
   const otherInfo = [];

   if (data.dateOfBirth?.month) {
      otherInfo.push(
         `**Birthday:** ${getMonth(data.dateOfBirth.month)} ${
            data.dateOfBirth.day || "N/A"
         }, ${data.dateOfBirth.year || "N/A"}`,
      );
   }
   otherInfo.push(`**Age:** ${data.age || "N/A"}`);
   otherInfo.push(`**Gender:** ${data.gender || "N/A"}`);
   otherInfo.push(
      `**Years active:** ${
         data.yearsActive?.[0]
            ? `${data.yearsActive[0]}-${data.yearsActive[1] || "Present"}`
            : "N/A"
      }`,
   );
   otherInfo.push(`**Hometown:** ${data.homeTown || "N/A"}`);
   otherInfo.push(`**Blood Type:** ${data.bloodType || "N/A"}\n`);

   //__</other_info>

   //__<description_data>
   let description = ["No data"];
   if (data.description) description = parseDescription(data.description);

   let length = 0;
   let final = otherInfo.join("\n");
   for (const part of description) {
      length += part.length + 2;
      if (length < 2047) final += part;
   }

   const mainAnimeTitles = [];
   if (data.characters?.nodes) {
      for (const character of data.characters.nodes) {
         mainAnimeTitles.push(
            `• [${character?.name?.full || "N/A"}](${character?.siteUrl || "N/A"})`,
         );
         if (mainAnimeTitles.length > 3) break;
      }
   }

   //__</description_data>

   const characterEmbed = new MessageEmbed()
      .setColor("DARK_NAVY")
      .setTitle(data.name?.full || "N/A")
      .setURL(data.siteUrl || "N/A")
      .setThumbnail(data.image?.large || "N/A")
      .setDescription(final)
      .addFields({
         name: "Main voiced characters:",
         value: mainAnimeTitles.join("\n") || "N/A",
      })
      .setTimestamp();

   return characterEmbed;
}

function parseDescription(descriptionText: string) {
   const descriptionArray = [];

   descriptionText = descriptionText
      .replace(/<br>/g, "\n")
      .replace(/~!/g, "\n||")
      .replace(/!~/g, "||")
      .replace(/__/g, "**")
      .replace(/<\/?[^>]+(>|$)/g, "");

   const spoilerSplitted = descriptionText.split("||");

   let alternation = 0;
   for (const chunk of spoilerSplitted) {
      if (alternation === 0) {
         const replaced = chunk.replace(/\./g, ".<");
         const dotSplitted = replaced.split("<");

         descriptionArray.push(...dotSplitted);
         alternation = 1;
      } else {
         descriptionArray.push(`||${chunk}||`);
         alternation = 0;
      }
   }

   return descriptionArray;
}

interface Query {
   data: {
      Staff: {
         name: {
            full: string;
         };
         image: {
            large: string;
         };
         dateOfBirth: {
            day: number;
            month: number;
            year: number;
         };
         characters: {
            nodes: {
               name: {
                  full: string;
               };
               siteUrl: string;
            }[];
         };
         description: string;
         siteUrl: string;
         age: string;
         gender: string;
         yearsActive: string[];
         homeTown: string;
         bloodType: string;
      };
   };
}

function queryInit(identifier: StaffName | StaffId) {
   if (typeof identifier === "number") {
      return /* GraphQL */ `
         {
            Staff(id: ${identifier}) {
               name {
                  full
               }
               image {
                  large
               }
               dateOfBirth {
                  day
                  month
                  year
               }
               characters(sort: FAVOURITES_DESC) {
                  nodes {
                     name {
                        full
                     }
                     siteUrl
                  }
               }
               description
               siteUrl
               age
               gender
               yearsActive
               homeTown
               bloodType
            }
         }
      `;
   } else {
      return /* GraphQL */ `
         {
            Staff(search: "${identifier}") {
               name {
                  full
               }
               image {
                  large
               }
               dateOfBirth {
                  day
                  month
                  year
               }
               characters(sort: FAVOURITES_DESC) {
                  nodes {
                     name {
                        full
                     }
                     siteUrl
                  }
               }
               description
               siteUrl
               age
               gender
               yearsActive
               homeTown
               bloodType
            }
         }
      `;
   }
}
