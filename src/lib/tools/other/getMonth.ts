export function getMonth(number: number) {
   if (isNaN(number)) {
      return "NaN";
   } else {
      const monthNames = [
         "Jan",
         "Feb",
         "Mar",
         "Apr",
         "May",
         "Jun",
         "Jul",
         "Aug",
         "Sep",
         "Oct",
         "Nov",
         "Dec",
      ];
      return monthNames[number - 1];
   }
}
