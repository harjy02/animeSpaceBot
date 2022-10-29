import type { Args, CommandOptions } from "@sapphire/framework";

import { ApplyOptions } from "@sapphire/decorators";
import { BotMessageCommand } from "lib/class/botMessageCommand";
import type { Message } from "discord.js";
import { reloadChangelog } from "lib/commands/help/helpChangelogList";

@ApplyOptions<CommandOptions>({
   description: "null",
   preconditions: ["OwnerOnly"],
   requiredClientPermissions: ["SEND_MESSAGES"],
})
export default class extends BotMessageCommand {
   async messageRun(message: Message, _args: Args): Promise<Message | void> {
      await reloadChangelog();

      message.reply("Changelog reloaded!");
   }
}
