import { Events, Listener } from "@sapphire/framework";

import type { Message } from "discord.js";

export class UserEvent extends Listener<typeof Events.MentionPrefixOnly> {
   public async run(message: Message) {
      const prefix = await this.container.client.fetchPrefix(message);
      return message.reply(
         message.channel.type === "DM"
            ? "You do not need a prefix in DMs."
            : `My prefix in this guild is: \`${prefix}\``,
      );
   }
}
