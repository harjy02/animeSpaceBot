import { Listener } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Listener {
   public async run(message: Message) {
      if (message.channel.type !== "DM") return;
      if (message.content.startsWith("-")) {
         message.reply(
            "In dm a prefix isn't required, run the command without the prefix to use it",
         );
      }
   }
}
