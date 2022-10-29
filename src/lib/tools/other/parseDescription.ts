export function parseDescription(
   descriptionText: string,
   maxLength: number,
): DescriptionData {
   const descriptionArray = [];

   descriptionText = descriptionText
      .replace(/<br><br>/g, "\n")
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

   let length = 0;
   let final = "";
   for (const part of descriptionArray) {
      length += part.length + 2;
      if (length < maxLength) final += part;
   }

   if (length < maxLength) {
      return {
         description: final,
         limitReached: false,
      };
   } else {
      return {
         description: final,
         limitReached: true,
      };
   }
}

interface DescriptionData {
   description: string;
   limitReached: boolean;
}
