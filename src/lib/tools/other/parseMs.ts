import prettyMilliseconds from "pretty-ms";

export function parseMs(milliseconds: number) {
   if (milliseconds < 60000) return "Less than a minute";

   return prettyMilliseconds(roundMinute(milliseconds));
}

function roundMinute(milliseconds: number) {
   const hours = milliseconds / 1000 / 60;
   const rounded = Math.round(hours);
   return rounded * 1000 * 60;
}
