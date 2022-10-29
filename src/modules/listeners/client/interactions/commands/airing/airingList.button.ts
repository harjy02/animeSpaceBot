import { ButtonInteraction, MessageButton } from "discord.js";
import { catchNewError } from "lib/errors/errorHandling";
import { Listener } from "@sapphire/framework";
import airing from "modules/slash-commands/3)other commands/airing";

export default class extends Listener {
   public async run(interaction: ButtonInteraction) {
      try {
         airing.subCommandAnimeList(interaction);
      } catch (error: any) {
         interaction.deferUpdate();
         catchNewError(error);
      }
   }
}

export function airingListButton() {
   const customIdValues: ButtonTuple = ["airingList.button"];

   const button = new MessageButton()
      .setCustomId(JSON.stringify(customIdValues))
      .setLabel(`View airing list`)
      .setStyle("SECONDARY");

   return button;
}

type ButtonTuple = [customId: string];
