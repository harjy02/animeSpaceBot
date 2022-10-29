import { container } from "@sapphire/pieces";
import { botTopGgPage, inviteLink } from "assets/config";
import { MessageEmbed } from "discord.js";
import { maxLengthLine } from "lib/tools/text/maxLengthLine";

export async function helpHome() {
   const embedDescription = [];

   embedDescription.push("Support server: [Anime Space](https://discord.gg/sYAceP6Pmf)");
   embedDescription.push(`Bot top.gg page: [AnimeSpace top.gg](${botTopGgPage})`);
   embedDescription.push(`Invite the bot: [bot link](${inviteLink})`);
   embedDescription.push("");
   embedDescription.push(
      `To view informations about specific command run \`/help <command>\``,
   );
   embedDescription.push("");
   embedDescription.push("**Slash commands:**");

   const categories: { id: number; value: string }[] = [];

   for (const category of container.stores.get("slash-commands").categories) {
      if (category.startsWith("_")) continue;

      const categorySplit = category.split(")");

      const categoryIndex = parseInt(categorySplit.shift()!);
      const categoryName = categorySplit.join("");

      const categoryLabel = `◆ **[${categoryName + ":"}](${botTopGgPage})** `;
      const commands: string[] = [];
      const categoryCollection = container.stores
         .get("slash-commands")
         .filter((command) => command.category === category);
      for (const each of categoryCollection) commands.push("`" + "/" + each[0] + "`");

      const sizedLines = maxLengthLine(commands, " ", 45);
      const categoryValues: string[] = [];
      sizedLines.forEach((value) => categoryValues.push(" " + value));

      categories.push({
         id: categoryIndex,
         value: `${categoryLabel}\n${categoryValues.join("\n")}`,
      });
   }

   categories.sort((a, b) => a.id - b.id);
   categories.forEach((value) => embedDescription.push(value.value));

   const embed = new MessageEmbed()
      .setColor("RED")
      .setTitle("help")
      .setTimestamp()
      .setDescription(embedDescription.join("\n"));

   return embed;
}
