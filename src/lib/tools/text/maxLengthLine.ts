export function maxLengthLine(arr: string[], separator: string, max: number) {
   const text: string[] = [];
   let line: string[] = [];

   let length = 0;

   for (const each of arr) {
      length = length + each.length;

      const completeLength = length + line.length * separator.length;

      if (completeLength >= max) {
         text.push(line.join(separator));
         line = [each];
         length = each.length;
      } else {
         line.push(each);
      }
   }

   if (line.length) text.push(line.join(separator));

   return text;
}
