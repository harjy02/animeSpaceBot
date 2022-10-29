import type { Message } from "discord.js";

export function nsfwAlert(message: Message) {
   return message.reply(
      "The media you are trying to search includes nsfw content, to view it run this command in a channel enabled to view nsfw content",
   );
}
