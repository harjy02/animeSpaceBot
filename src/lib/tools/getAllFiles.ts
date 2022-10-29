import { readdirSync, statSync } from "fs";

import path from "path";

export const getAllFiles = function (dirPath: string, arrayOfFiles: string[] = []) {
   const files = readdirSync(dirPath);

   arrayOfFiles = arrayOfFiles || [];

   files.forEach(function (file) {
      if (statSync(dirPath + "/" + file).isDirectory())
         arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
      else arrayOfFiles.push(path.join(dirPath, "/", file));
   });

   return arrayOfFiles;
};