import { botTopGgPage } from "assets/config";
import { container } from "@sapphire/pieces";
import { reply } from "assets/emoji";
import { stringParam } from "lib/tools/text/stringParam";

export function helpCategoryCommandList(selection: string) {
   const categoryData = container.stores
      .get("slash-commands")
      .filter((command) => command.category === selection);

   if (!categoryData) return null;

   //__<pageSetup>
   //single page content
   let page: string[] = [];
   //all pages content
   const pagesContent = [];

   for (const category of categoryData) {
      // category[0] = category name
      // category[1] = command
      page.push(`● **[${category[0]}](${botTopGgPage})**:`);

      const description = category[1].description || "N/A";

      const length = page.push(`${reply.emoji}${stringParam(description)}`);
      if (length >= 16) {
         // 32 = per page lines, every command is composed of 4 lines -> 8 commands
         pagesContent.push(page);
         page = [];
      }
   }
   if (page.length > 0) pagesContent.push(page);

   return pagesContent.map((value) => value.join("\n"));
}
