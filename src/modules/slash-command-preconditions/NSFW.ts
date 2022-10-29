import {
   SlashCommandPrecondition,
   SlashCommandPreconditionResult,
} from "lib/slashCommands/framework/lib/structures/SlashCommandPrecondition";

import type { CommandInteraction } from "discord.js";
import { Identifiers } from "lib/slashCommands/framework/lib/errors/Identifiers";

export class NSFWPrecondition extends SlashCommandPrecondition {
   public run(interaction: CommandInteraction): SlashCommandPreconditionResult {
      // `nsfw` is undefined in DMChannel, writing `=== true` will result in it returning`false`.
      return interaction.channel && Reflect.get(interaction.channel, "nsfw") === true
         ? this.ok()
         : this.error({
              identifier: Identifiers.PreconditionNSFW,
              message: "You cannot run this command outside NSFW channels.",
           });
   }
}
