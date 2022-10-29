import type { Args, CommandOptions } from "@sapphire/framework";

import { ApplyOptions } from "@sapphire/decorators";
import { BotMessageCommand } from "lib/class/botMessageCommand";
import type { Message } from "discord.js";

@ApplyOptions<CommandOptions>({
   description: "null",
   preconditions: ["OwnerOnly"],
   requiredClientPermissions: ["SEND_MESSAGES"],
})
export default class extends BotMessageCommand {
   async messageRun(message: Message, args: Args): Promise<Message | void> {
      const guildId = await args.rest("string");

      const guild = await this.container.client.guilds.fetch(guildId);
      await guild.leave();

      message.channel.send(`left guild: ${guild.name}`);
   }
}
