import { AliasStore } from "@sapphire/pieces";
import { SlashCommand } from "./SlashCommand";

export default class SlashCommandStore extends AliasStore<SlashCommand> {
   constructor() {
      super(SlashCommand as any, { name: "slash-commands" });
   }
   /**
    * Get all the command categories.
    */
   get categories() {
      const categories = new Set(this.map((command) => command.category));
      categories.delete(null);
      return [...(categories as Set<string>)];
   }
}
