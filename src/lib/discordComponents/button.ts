import { MessageActionRow, MessageButton } from "discord.js";

type ButtonNumber = 0 | 1 | 2 | 3 | 4;

interface Buttons {
   button: MessageButton;
   isHidden: boolean;
   isDisabled: boolean;
}

export class ButtonRow {
   private buttons: [Buttons, Buttons?, Buttons?, Buttons?, Buttons?];

   constructor(buttons: MessageButton[] | ButtonRow) {
      if (buttons instanceof ButtonRow) {
         this.buttons = buttons.buttons;
      } else {
         if (buttons.length > 5)
            throw new Error("Maximum 5 buttons can be added to the buttonRow class");

         this.buttons = [
            {
               button: buttons.shift() as MessageButton,
               isHidden: false,
               isDisabled: false,
            },
         ];

         for (const button of buttons) {
            this.buttons.push({
               button: button as MessageButton,
               isHidden: false,
               isDisabled: false,
            });
         }
      }
   }

   disableButton(buttonNumber: ButtonNumber[]) {
      for (const index of buttonNumber) this.buttons[index]!.isDisabled = true;
      return this;
   }

   enableButton(buttonNumber: ButtonNumber[]) {
      for (const index of buttonNumber) this.buttons[index]!.isDisabled = false;
      return this;
   }

   hideButton(buttonNumber: ButtonNumber[]) {
      for (const index of buttonNumber) this.buttons[index]!.isHidden = true;
      return this;
   }

   showButton(buttonNumber: ButtonNumber[]) {
      for (const index of buttonNumber) this.buttons[index]!.isHidden = false;
      return this;
   }

   disableAll() {
      for (const button of this.buttons) button!.isDisabled = true;
      return this;
   }

   row() {
      const buttonRow = [];

      for (const button of this.buttons) {
         const newButton = new MessageButton(button?.button!);

         if (button?.isHidden) continue;
         if (button?.isDisabled) newButton.setDisabled(true);
         buttonRow.push(newButton);
      }

      if (!buttonRow.length) return undefined;

      return new MessageActionRow().addComponents(buttonRow);
   }
}
