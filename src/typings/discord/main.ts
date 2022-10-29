import type {
   ButtonInteraction,
   CommandInteraction,
   ContextMenuInteraction,
   MessageComponentInteraction,
   SelectMenuInteraction,
} from "discord.js";

export type ReplyInteractions =
   | ButtonInteraction
   | CommandInteraction
   | ContextMenuInteraction
   | MessageComponentInteraction
   | SelectMenuInteraction;
