import { ButtonInteraction, MessageButton } from "discord.js";
import { catchNewError } from "lib/errors/errorHandling";
import { Listener } from "@sapphire/framework";
import { loginModal } from "./login.modal";

export default class extends Listener {
   public async run(interaction: ButtonInteraction) {
      try {
         const modal = loginModal();

         interaction.showModal(modal);
      } catch (error: any) {
         interaction.deferUpdate();
         catchNewError(error);
      }
   }
}

export function loginButton() {
   const customIdValues: ButtonTuple = ["login.button"];

   const button = new MessageButton()
      .setCustomId(JSON.stringify(customIdValues))
      .setLabel("Input login token")
      .setStyle("SUCCESS");

   return button;
}

type ButtonTuple = [customId: string];
