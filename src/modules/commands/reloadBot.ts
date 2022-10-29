import type { Args, CommandOptions } from "@sapphire/framework";

import { ApplyOptions } from "@sapphire/decorators";
import { BotMessageCommand } from "lib/class/botMessageCommand";
import type { Message } from "discord.js";
import { reloadLib } from "lib/reloadLib";

@ApplyOptions<CommandOptions>({
   description: "null",
   preconditions: ["OwnerOnly"],
   requiredClientPermissions: ["SEND_MESSAGES"],
})
export default class extends BotMessageCommand {
   async messageRun(message: Message, _args: Args): Promise<Message | void> {
      this.container.stores.get("commands").forEach((value) => value.reload());

      reloadLib();

      message.reply("reload done!");
   }
}
