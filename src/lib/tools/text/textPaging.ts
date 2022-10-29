export function textPaging(textArray: string[], separator: string, length: number) {
   const finalArray: string[] = [];

   let currentArray: string[] = [];
   let currentLength = 0;

   for (const each of textArray) {
      currentLength = currentLength + each.length;

      if (currentLength < length) {
         currentArray.push(each);
      } else {
         finalArray.push(currentArray.join(separator));
         currentArray = [];

         currentArray.push(each);
         currentLength = each.length;
      }
   }

   if (currentArray.length > 0) finalArray.push(currentArray.join(separator));

   return finalArray;
}
