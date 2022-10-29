export type Color = "blue" | "purple" | "pink" | "orange" | "red" | "green" | "gray";

export function parseColor(
   color: "blue" | "purple" | "pink" | "orange" | "red" | "green" | "gray",
) {
   switch (color) {
      case "blue": {
         return "#3CB4F1";
      }
      case "purple": {
         return "#C163FF";
      }
      case "pink": {
         return "#FC9DD5";
      }
      case "orange": {
         return "#EE881A";
      }
      case "red": {
         return "#E13334";
      }
      case "green": {
         return "#4DCA52";
      }
      case "gray": {
         return "#677B94";
      }
      default: {
         return "#2B2C30";
      }
   }
}
