import { MessageEmbed } from "discord.js";
import { getWaifuPic } from "./waifuPicsWrapper";

const sfwList: string[] = [];
const nsfwList: string[] = [];

getWaifuPic("sfw", "neko", "many").then((pics) => sfwList.push(...pics.files));
getWaifuPic("nsfw", "neko", "many").then((pics) => nsfwList.push(...pics.files));

async function getNekoData(type: "sfw" | "nsfw") {
   if (type === "sfw") {
      if (sfwList.length <= 5)
         getWaifuPic("sfw", "neko", "many").then((pics) => sfwList.push(...pics.files));

      const element = sfwList.shift();

      if (element) {
         return element;
      } else {
         const data = (await getWaifuPic("sfw", "neko", "many")).files;
         const toReturn = data.shift()!;
         sfwList.push(...data);
         return toReturn;
      }
   } else {
      if (nsfwList.length <= 5)
         getWaifuPic("nsfw", "neko", "many").then((pics) => nsfwList.push(...pics.files));

      const element = nsfwList.shift();

      if (element) {
         return element;
      } else {
         const data = (await getWaifuPic("nsfw", "neko", "many")).files;
         const toReturn = data.shift()!;
         nsfwList.push(...data);
         return toReturn;
      }
   }
}

export async function getNekoEmbed(type: "sfw" | "nsfw") {
   const image = await getNekoData(type);

   const embed = new MessageEmbed()
      .setImage(image)
      .setFooter({ text: `Source: ${image}` });

   return embed;
}
