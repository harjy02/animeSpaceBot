import { Listener } from "@sapphire/framework";
import { arrowRight, arrowLeft } from "assets/emoji";
import { type ButtonInteraction, MessageEmbed, MessageButton } from "discord.js";
import { helpCategoryCommandList } from "lib/commands/help/helpCategoryCommandList";
import { ButtonRow } from "lib/discordComponents/button";
import { setComponent } from "lib/discordComponents/component";
import { catchNewError } from "lib/errors/errorHandling";
import { helpMenu } from "../help.selectMenu";

export default class extends Listener {
   public async run(interaction: ButtonInteraction, arr: CommandCategoryButtonTuple) {
      try {
         const tuple = arr as CommandCategoryButtonTuple;

         const authorId = tuple[1];
         const page = tuple[2];
         const selection = tuple[3];

         const regSelection = selection.match(/(?<=\)).*/)?.shift() || "";

         if (interaction.user.id !== authorId) {
            return interaction.reply({
               content: "This interaction is not for you..",
               ephemeral: true,
            });
         }

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

         const currentPageContent = pagesContent[page];

         const hasNext = pagesContent[page + 1] ? true : false;
         const hasBack = pagesContent[page - 1] ? true : false;

         const buttonRow = new ButtonRow([
            commandCategoryButton(authorId, page - 1, selection, "back"),
            commandCategoryButton(authorId, page + 1, selection, "next"),
         ]);

         if (!hasBack) buttonRow.hideButton([0]);
         if (!hasNext) buttonRow.hideButton([1]);

         return interaction.update({
            embeds: [embed.setDescription(currentPageContent)],
            components: setComponent(
               helpMenu(authorId, `Category: ${regSelection}`),
               buttonRow,
            ),
         });
      } catch (error: any) {
         interaction.deferUpdate();
         catchNewError(error);
      }
   }
}

export function commandCategoryButton(
   authorId: string,
   page: number,
   selection: string,
   type: "next" | "back",
) {
   const customIdValues: CommandCategoryButtonTuple = [
      "help.paging.commandCategory",
      authorId,
      page,
      selection,
   ];

   const button =
      type === "next"
         ? new MessageButton()
              .setCustomId(JSON.stringify(customIdValues))
              .setLabel("Next")
              .setEmoji(arrowRight.id)
              .setStyle("PRIMARY")
         : new MessageButton()
              .setCustomId(JSON.stringify(customIdValues))
              .setLabel("Back")
              .setEmoji(arrowLeft.id)
              .setStyle("PRIMARY");

   return button;
}

type CommandCategoryButtonTuple = [
   customId: string,
   authorId: string,
   page: number,
   selection: string,
];
