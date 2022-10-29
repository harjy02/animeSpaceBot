import { MessageEmbed } from "discord.js";
import { getWaifuPic } from "./waifuPicsWrapper";

const sfwList: string[] = [];

getWaifuPic("sfw", "shinobu", "many").then((pics) => sfwList.push(...pics.files));

async function getShinobuData() {
   if (sfwList.length <= 5)
      getWaifuPic("sfw", "shinobu", "many").then((pics) => sfwList.push(...pics.files));

   const element = sfwList.shift();

   if (element) {
      return element;
   } else {
      const data = (await getWaifuPic("sfw", "shinobu", "many")).files;
      const toReturn = data.shift()!;
      sfwList.push(...data);
      return toReturn;
   }
}

export async function getShinobuEmbed() {
   const image = await getShinobuData();

   const embed = new MessageEmbed()
      .setImage(image)
      .setFooter({ text: `Source: ${image}` });

   return embed;
}
