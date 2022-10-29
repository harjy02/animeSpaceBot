import { Listener } from "@sapphire/framework";
import { type ButtonInteraction, MessageButton } from "discord.js";
import { helpHome } from "lib/commands/help/helpHome";
import { catchNewError } from "lib/errors/errorHandling";
import { helpMainComponents } from "../help.selectMenu";

export default class extends Listener {
   public async run(interaction: ButtonInteraction, arr: HelpHomeButtonTuple) {
      try {
         const tuple = arr as HelpHomeButtonTuple;

         const authorId = tuple[1];

         if (interaction.user.id !== authorId) {
            return interaction.reply({
               content: "This interaction is not for you..",
               ephemeral: true,
            });
         }

         const embed = await helpHome();

         return interaction.update({
            embeds: [embed],
            components: helpMainComponents(authorId),
         });
      } catch (error: any) {
         interaction.deferUpdate();
         catchNewError(error);
      }
   }
}

export function helpHomeButton(authorId: string) {
   const customIdValues: HelpHomeButtonTuple = ["help.paging.home", authorId];

   const button = new MessageButton()
      .setCustomId(JSON.stringify(customIdValues))
      .setLabel("Home")
      .setStyle("SUCCESS");

   return button;
}

type HelpHomeButtonTuple = [customId: string, authorId: string];
