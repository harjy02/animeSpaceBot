import {
   SlashCommandPrecondition,
   SlashCommandPreconditionResult,
} from "lib/slashCommands/framework/lib/structures/SlashCommandPrecondition";

import type { CommandInteraction } from "discord.js";
import { Identifiers } from "lib/slashCommands/framework/lib/errors/Identifiers";

export class GuildThreadOnlyPrecondition extends SlashCommandPrecondition {
   public run(interaction: CommandInteraction): SlashCommandPreconditionResult {
      return interaction.channel?.isThread()
         ? this.ok()
         : this.error({
              identifier: Identifiers.PreconditionThreadOnly,
              message: "You can only run this command in server thread channels.",
           });
   }
}
