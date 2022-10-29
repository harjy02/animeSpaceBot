import { MessageEmbed } from "discord.js";
import { getWaifuPic } from "./waifuPicsWrapper";

const sfwList: string[] = [];
const nsfwList: string[] = [];

getWaifuPic("sfw", "waifu", "many").then((pics) => sfwList.push(...pics.files));
getWaifuPic("nsfw", "waifu", "many").then((pics) => nsfwList.push(...pics.files));

async function getWaifuData(type: "sfw" | "nsfw") {
   if (type === "sfw") {
      if (sfwList.length <= 5)
         getWaifuPic("sfw", "waifu", "many").then((pics) => sfwList.push(...pics.files));

      const element = sfwList.shift();

      if (element) {
         return element;
      } else {
         const data = (await getWaifuPic("sfw", "waifu", "many")).files;
         const toReturn = data.shift()!;
         sfwList.push(...data);
         return toReturn;
      }
   } else {
      if (nsfwList.length <= 5)
         getWaifuPic("nsfw", "waifu", "many").then((pics) => sfwList.push(...pics.files));

      const element = nsfwList.shift();

      if (element) {
         return element;
      } else {
         const data = (await getWaifuPic("nsfw", "waifu", "many")).files;
         const toReturn = data.shift()!;
         nsfwList.push(...data);
         return toReturn;
      }
   }
}

export async function getWaifuEmbed(type: "sfw" | "nsfw") {
   const image = await getWaifuData(type);

   const embed = new MessageEmbed()
      .setImage(image)
      .setFooter({ text: `Source: ${image}` });

   return embed;
}
