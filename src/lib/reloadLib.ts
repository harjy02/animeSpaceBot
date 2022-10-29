import { getAllFiles } from "./tools/getAllFiles";

export function reloadLib(log?: boolean) {
   const files = getAllFiles(__dirname);

   for (const each of files) {
      if (log) console.log(each);

      delete require.cache[require.resolve(each)];
   }
}
