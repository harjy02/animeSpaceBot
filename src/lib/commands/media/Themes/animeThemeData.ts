import type { DeepNullable } from "typings/other/deepNullable";
import fetch from "node-fetch";

export async function getAnimeThemeData(idMal: number) {
   const fetchData = await fetch(`https://themes.moe/api/themes/${idMal}`)
      .then(async (response) => {
         if (!response.ok) return undefined;
         const result = await response.text();
         if (!response.ok) {
            throw new Error(result);
         } else {
            const json = await JSON.parse(result);
            return json as DeepNullable<FetchThemeData[]>;
         }
      })
      .catch((error) => {
         throw error;
      });

   const themeData: AnimeThemeData = {
      op: [],
      ed: [],
   };

   if (fetchData) {
      for (const eachFetchData of fetchData) {
         const themes = eachFetchData?.themes;
         if (!themes) continue;

         const opening: ThemeType[] = [];
         const ending: ThemeType[] = [];

         for (const theme of themes) {
            if (theme?.themeType?.includes("V") && !theme.themeType.includes("V1"))
               continue;

            const idMatch = theme?.themeType?.match(/\d+/);
            const id = idMatch ? parseInt(idMatch[0]) : 0;

            if (theme?.themeType?.includes("OP")) {
               opening.push({
                  id,
                  name: theme.themeName || "N/A",
                  url: theme?.mirror?.mirrorURL || "N/A",
               });
            }
            if (theme?.themeType?.includes("ED")) {
               ending.push({
                  id,
                  name: theme.themeName || "N/A",
                  url: theme?.mirror?.mirrorURL || "N/A",
               });
            }
         }

         opening.sort((a, b) => a.id - b.id);
         ending.sort((a, b) => a.id - b.id);

         themeData.op.push(...opening);
         themeData.ed.push(...ending);
      }
   }

   return themeData;
}

export interface AnimeThemeData {
   op: ThemeType[];
   ed: ThemeType[];
}

interface FetchThemeData {
   idMal: number;
   name: string;
   year: number;
   season: string;
   themes: FetchThemes[];
}

interface FetchThemes {
   themeType: `OP${number}` | `ED${number}`;
   themeName: string;
   mirror: {
      mirrorURL: string;
      priority: number;
      notes: string;
   };
}

interface ThemeType {
   id: number;
   name: string;
   url: string;
}
