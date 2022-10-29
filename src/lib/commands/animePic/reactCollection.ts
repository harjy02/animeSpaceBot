import { ApplicationCommandOptionChoiceData, MessageEmbed } from "discord.js";
import { go, prepare } from "fuzzysort";
import { getWaifuPic } from "./waifuPicsWrapper";

const list: Map<string, string[]> = new Map();

async function getReactData(category: ReactionCategories) {
   const refList = list.get(category)!;

   if (refList.length <= 5)
      getWaifuPic("sfw", category, "many").then((pics) => refList.push(...pics.files));

   const element = refList.shift();

   if (element) {
      return element;
   } else {
      const data = (await getWaifuPic("sfw", category, "many")).files;
      const toReturn = data.shift()!;
      refList.push(...data);
      return toReturn;
   }
}

export async function getReactEmbed(category: ReactionCategories) {
   const image = await getReactData(category);

   const embed = new MessageEmbed().setImage(image);

   return embed;
}

export function getReactOptions(search: string) {
   if (search === "") {
      const returnData = reactionCategories.map((value) => {
         return {
            name: value,
            value: "[" + value + "]",
         };
      }) as ApplicationCommandOptionChoiceData[];

      return returnData.splice(0, 25);
   }

   const result = go(search, preparedReactionCategories, {
      limit: 10, // don't return more results than you need!
      threshold: -10000, // don't return bad results
   });

   const returnData = result.map((value) => {
      return {
         name: value.target,
         value: "[" + value.target + "]",
      };
   }) as ApplicationCommandOptionChoiceData[];

   return returnData;
}

const reactionCategories = [
   "bully",
   "cuddle",
   "cry",
   "hug",
   "awoo",
   "kiss",
   "pat",
   "smug",
   "bonk",
   "yeet",
   "blush",
   "smile",
   "wave",
   "highfive",
   "handhold",
   "nom",
   "bite",
   "glomp",
   "slap",
   "kill",
   "kick",
   "happy",
   "wink",
   "poke",
   "dance",
   "cringe",
] as ReactionCategories[];

const preparedReactionCategories = reactionCategories.map((each) => prepare(each));

reactionCategories.forEach((eachCategory) => {
   getWaifuPic("sfw", eachCategory, "many").then((pics) =>
      list.set(eachCategory, pics.files),
   );
});

export type ReactionCategories =
   | "bully"
   | "cuddle"
   | "cry"
   | "hug"
   | "awoo"
   | "kiss"
   | "pat"
   | "smug"
   | "bonk"
   | "yeet"
   | "blush"
   | "smile"
   | "wave"
   | "highfive"
   | "handhold"
   | "nom"
   | "bite"
   | "glomp"
   | "slap"
   | "kill"
   | "kick"
   | "happy"
   | "wink"
   | "poke"
   | "dance"
   | "cringe";
