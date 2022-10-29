import type { Args, CommandOptions } from "@sapphire/framework";

import { ApplyOptions } from "@sapphire/decorators";
import { BotMessageCommand } from "lib/class/botMessageCommand";
import type { Message } from "discord.js";
import { testingMode, testingModeState } from "assets/config";

@ApplyOptions<CommandOptions>({
   aliases: ["test"],
   description: "null",
   preconditions: ["OwnerOnly"],
   requiredClientPermissions: ["SEND_MESSAGES"],
})
export default class extends BotMessageCommand {
   async messageRun(message: Message, _args: Args): Promise<Message | void> {
      if (testingMode) testingModeState(false);
      else testingModeState(true);

      message.reply(`Testing mode state changed to: ${testingMode}`);
   }
}
