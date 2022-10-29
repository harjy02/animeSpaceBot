import type { Message } from "discord.js";
import { Precondition } from "@sapphire/framework";
import { envOwners } from "assets/config";

export class UserPrecondition extends Precondition {
   public async run(message: Message) {
      return envOwners.includes(message.author.id)
         ? this.ok()
         : this.error({ message: "This command can only be used by the owner." });
   }
}
