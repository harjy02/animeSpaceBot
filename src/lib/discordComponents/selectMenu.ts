import { MessageActionRow, MessageSelectMenu } from "discord.js";

export interface SelectMenuOptions {
   customId: string;
   placeHolder: string;
   singlePick: boolean;
   options: {
      label: string;
      description?: string;
      value: string;
   }[];
}

export class SelectMenuRow {
   selectMenuRow: MessageActionRow;

   constructor(menu: SelectMenuOptions, isDisabled?: boolean);
   constructor(menu: SelectMenuRow);
   constructor(menu: SelectMenuOptions | SelectMenuRow, isDisabled?: boolean) {
      if (menu instanceof SelectMenuRow) {
         this.selectMenuRow = menu.selectMenuRow;
      } else {
         const selectMenu = new MessageSelectMenu()
            .setCustomId(menu.customId)
            .setPlaceholder(menu.placeHolder)
            .addOptions(menu.options)
            .setDisabled(!isDisabled ? false : isDisabled);

         if (!menu.singlePick) selectMenu.setMinValues(1);

         this.selectMenuRow = new MessageActionRow().addComponents(selectMenu);
      }
   }

   disableMenu() {
      const selectMenu = this.selectMenuRow.components[0] as MessageSelectMenu;
      selectMenu.setDisabled(true);
      return this;
   }

   enableMenu() {
      const selectMenu = this.selectMenuRow.components[0] as MessageSelectMenu;
      selectMenu.setDisabled(false);
      return this;
   }

   setPlaceHolder(placeholder: string) {
      const selectMenu = this.selectMenuRow.components[0] as MessageSelectMenu;
      selectMenu.setPlaceholder(placeholder);
      return this;
   }

   disableAll() {
      for (const menu of this.selectMenuRow.components) menu.setDisabled(true);
      return this;
   }

   row() {
      return this.selectMenuRow;
   }
}
