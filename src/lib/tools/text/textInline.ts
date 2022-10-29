export function textInline(rows: Spacing[][]) {
   const returnText: string[] = [];

   for (const row of rows) returnText.push(textSpacing(row));

   return returnText.join("\n");
}

interface Spacing {
   step: string;
   spacing: number;
}



function textSpacing(row: Spacing[]) {
   let finalRow = "";

   for (const space of row) {
      finalRow = finalRow + space.step.padEnd(space.spacing, " ");

      if (!Number.isInteger(space.spacing)) {
         const decimalStr = space.spacing.toString().split(".")[1];
         const decimalPart = Number(decimalStr);

         const endPad = " ".repeat(decimalPart);

         finalRow = finalRow + endPad;
      }
   }

   return finalRow;
}
