import { MessageEmbed } from "discord.js";
import { getWaifuPic } from "./waifuPicsWrapper";

const sfwList: string[] = [];

getWaifuPic("sfw", "megumin", "many").then((pics) => sfwList.push(...pics.files));

async function getMeguminData() {
   if (sfwList.length <= 5)
      getWaifuPic("sfw", "megumin", "many").then((pics) => sfwList.push(...pics.files));

   const element = sfwList.shift();

   if (element) {
      return element;
   } else {
      const data = (await getWaifuPic("sfw", "megumin", "many")).files;
      const toReturn = data.shift()!;
      sfwList.push(...data);
      return toReturn;
   }
}

export async function getMeguminEmbed() {
   const image = await getMeguminData();

   const embed = new MessageEmbed()
      .setImage(image)
      .setFooter({ text: `Source: ${image}` });

   return embed;
}
