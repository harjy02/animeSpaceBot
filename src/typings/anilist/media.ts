export type MediaType = "ANIME" | "MANGA";
export type MediaFormat =
   | "TV"
   | "TV_SHORT"
   | "MOVIE"
   | "SPECIAL"
   | "OVA"
   | "ONA"
   | "MUSIC"
   | "MANGA"
   | "NOVEL"
   | "ONE_SHOT";
export type Status =
   | "CURRENT"
   | "PLANNING"
   | "COMPLETED"
   | "DROPPED"
   | "PAUSED"
   | "REPEATING";
export interface FuzzyDateInput {
   year: number; //Numeric Year (2017)

   month: number; // Numeric Month (3)

   day: number; // Numeric Day (24)
}
