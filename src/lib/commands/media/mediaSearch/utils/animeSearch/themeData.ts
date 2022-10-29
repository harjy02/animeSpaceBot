import type { DeepNullable } from "typings/other/deepNullable";
import fetch from "node-fetch";

export async function getThemeData(idMal: number) {
   const fetchData = await fetch(`https://themes.moe/api/themes/${idMal}`)
      .then(async (response) => {
         if (!response.ok) return undefined;
         const result = await response.text();
         if (!response.ok) {
            throw new Error(result);
         } else {
            const json = await JSON.parse(result);
            return json as DeepNullable<ThemeData[]>;
         }
      })
      .catch((error) => {
         throw error;
      });

   const themes = getThemes(fetchData);
   return themes;
}

interface ThemeData {
   idMal: number;
   name: string;
   year: number;
   season: string;
   themes: Themes[];
}

interface Themes {
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

function getThemes(themes: DeepNullable<ThemeData[]> | undefined) {
   if (!themes) return "`Not found`";
   const themesData = themes?.[0]?.themes;
   if (!themesData) return "`Not found`";

   const opening: ThemeType[] = [];
   const ending: ThemeType[] = [];

   for (const theme of themesData) {
      if (theme?.themeType?.includes("V") && !theme.themeType.includes("V1")) continue;

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

   const lastOP = opening.pop();
   const lastED = ending.pop();

   const textOp = lastOP
      ? `**Op** ${lastOP.id} _↬_ [${lastOP.name}](${lastOP.url})`
      : "**Op** _↬_ N/A";
   const textEd = lastED
      ? `**Ed** ${lastED.id} _↬_ [${lastED.name}](${lastED.url})`
      : "**Ed** _↬_ N/A";

   return `${textOp}\n${textEd}\n`;
}
