import { Listener } from "@sapphire/framework";
import { arrowRight, arrowLeft } from "assets/emoji";
import { type ButtonInteraction, MessageEmbed, MessageButton } from "discord.js";
import { helpChangelogList } from "lib/commands/help/helpChangelogList";
import { ButtonRow } from "lib/discordComponents/button";
import { setComponent } from "lib/discordComponents/component";
import { catchNewError } from "lib/errors/errorHandling";
import { helpHomeButton } from "./help.paging.home";

export default class extends Listener {
   public async run(interaction: ButtonInteraction, arr: ChangelogButtonTuple) {
      try {
         const tuple = arr as ChangelogButtonTuple;

         const authorId = tuple[1];
         const page = tuple[2];

         if (interaction.user.id !== authorId) {
            return interaction.reply({
               content: "This interaction is not for you..",
               ephemeral: true,
            });
         }

         const embed = new MessageEmbed();
         const pagesContent = await helpChangelogList();
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
            helpHomeButton(authorId),
            helpPagingChangelog(authorId, page - 1, "back"),
            helpPagingChangelog(authorId, page + 1, "next"),
         ]);

         if (!hasBack) buttonRow.hideButton([1]);
         if (!hasNext) buttonRow.hideButton([2]);

         return interaction.update({
            embeds: [embed.setDescription(currentPageContent)],
            components: setComponent(buttonRow),
         });
      } catch (error: any) {
         interaction.deferUpdate();
         catchNewError(error);
      }
   }
}

export function helpPagingChangelog(
   authorId: string,
   page: number,
   type: "next" | "back" | "home",
) {
   const customIdValues: ChangelogButtonTuple = ["help.paging.changelog", authorId, page];

   switch (type) {
      case "next": {
         return new MessageButton()
            .setCustomId(JSON.stringify(customIdValues))
            .setLabel("Next")
            .setEmoji(arrowRight.id)
            .setStyle("PRIMARY");
      }
      case "back": {
         return new MessageButton()
            .setCustomId(JSON.stringify(customIdValues))
            .setLabel("Back")
            .setEmoji(arrowLeft.id)
            .setStyle("PRIMARY");
      }
      case "home": {
         return new MessageButton()
            .setCustomId(JSON.stringify(customIdValues))
            .setLabel("Changelogs")
            .setStyle("PRIMARY");
      }
   }
}

type ChangelogButtonTuple = [customId: string, authorId: string, page: number];
