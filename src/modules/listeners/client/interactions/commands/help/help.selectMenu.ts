import { Listener, container } from "@sapphire/framework";
import { MessageEmbed, SelectMenuInteraction } from "discord.js";
import { SelectMenuOptions, SelectMenuRow } from "lib/discordComponents/selectMenu";

import { ButtonRow } from "lib/discordComponents/button";
import { catchNewError } from "lib/errors/errorHandling";
import { commandCategoryButton } from "./paging/help.paging.commandCategory";
import { helpCategoryCommandList } from "lib/commands/help/helpCategoryCommandList";
import { helpHome } from "lib/commands/help/helpHome";
import { helpPagingChangelog } from "./paging/help.paging.changelog";
import { setComponent } from "lib/discordComponents/component";

export default class extends Listener {
   public async run(interaction: SelectMenuInteraction, arr: MenuTuple) {
      try {
         const tuple = arr as MenuTuple;

         const authorId = tuple[1];
         const selection = interaction.values[0];
         const regSelection = selection.match(/(?<=\)).*/)?.shift() || "";

         if (interaction.user.id !== authorId) {
            return interaction.reply({
               content: "This interaction is not for you..",
               ephemeral: true,
            });
         }

         switch (selection) {
            case "firstPage": {
               return interaction.update({
                  embeds: [await helpHome()],
                  components: helpMainComponents(authorId),
               });
            }
            default: {
               //command categories
               const embed = new MessageEmbed().setTitle(
                  `Commands of category: \`${regSelection}\``,
               );
               const pagesContent = helpCategoryCommandList(selection);
               if (!pagesContent) {
                  return interaction.reply({
                     ephemeral: true,
                     content: "this page doesn't exist anymore",
                  });
               }

               const currentPageContent = pagesContent[0];
               if (pagesContent[1]) {
                  return interaction.update({
                     embeds: [embed.setDescription(currentPageContent)],
                     components: setComponent(
                        helpMenu(authorId, `Category: ${regSelection}`),
                        new ButtonRow([
                           commandCategoryButton(authorId, 1, selection, "next"),
                        ]),
                     ),
                  });
               } else {
                  return interaction.update({
                     embeds: [embed.setDescription(currentPageContent)],
                     components: setComponent(
                        helpMenu(authorId, `Category: ${regSelection}`),
                     ),
                  });
               }
            }
         }
      } catch (error: any) {
         interaction.deferUpdate();
         catchNewError(error);
      }
   }
}

export function helpMainComponents(authorId: string) {
   return setComponent(
      helpMenu(authorId),
      new ButtonRow([helpPagingChangelog(authorId, 0, "home")]),
   );
}

export function helpMenu(authorId: string, placeHolder?: string) {
   const customIdValues: MenuTuple = ["help.selectMenu", authorId];

   const selectMenuOptions: SelectMenuOptions = {
      customId: JSON.stringify(customIdValues),
      placeHolder: `${placeHolder || "Select a category to view details"}`,
      singlePick: true,
      options: [
         {
            label: "Categories commands list",
            value: "firstPage",
         },
      ],
   };

   const menuOptions: { number: number; content: string }[] = [];

   for (const category of container.stores.get("slash-commands").categories) {
      if (category.startsWith("_")) continue;

      const number = Number(category.match(/\w+(?=\))/)![0]);

      menuOptions.push({ number, content: category });
   }

   menuOptions.sort((a, b) => a.number - b.number);

   menuOptions.forEach((value) =>
      selectMenuOptions.options.push({ label: value.content, value: value.content }),
   );

   return new SelectMenuRow(selectMenuOptions);
}

type MenuTuple = [customId: string, authorId: string];
