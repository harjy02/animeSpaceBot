import { createFileSync, existsSync, readFileSync, writeFileSync } from "fs-extra";

export function appendJson(path: string, content: object) {
   //check if file exist
   if (!existsSync(path)) {
      //create new file if not exist

      createFileSync(path);
   }

   // read file
   const file = readFileSync(path, "utf8");

   //check if file is empty
   if (file.length === 0) {
      //add data to json file
      const data = [content];

      writeFileSync(path, JSON.stringify(data, null, 4));
   } else {
      //append data to jso file
      const parsed = JSON.parse(file);

      if (Array.isArray(parsed)) {
         parsed.push(content);
         writeFileSync(path, JSON.stringify(parsed, null, 4));
      } else {
         const data = [parsed, content];

         writeFileSync(path, JSON.stringify(data, null, 4));
      }
   }
}
