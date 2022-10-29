import {
   SlashCommandPrecondition,
   SlashCommandPreconditionResult,
} from "lib/slashCommands/framework/lib/structures/SlashCommandPrecondition";

import type { CommandInteraction } from "discord.js";
import { envOwners } from "assets/config";


export class OwnerOnlyPrecondition extends SlashCommandPrecondition {
   public run(interaction: CommandInteraction): SlashCommandPreconditionResult {
      return envOwners.includes(interaction.user.id)
         ? this.ok()
         : this.error({
              message:
                 "This command may be still in development for this reason it can only be used by the owner of the bot",
           });
   }
}
