import {
   SlashCommandPrecondition,
   SlashCommandPreconditionResult,
} from "lib/slashCommands/framework/lib/structures/SlashCommandPrecondition";

import type { CommandInteraction } from "discord.js";
import { Identifiers } from "lib/slashCommands/framework/lib/errors/Identifiers";

export class GuildOnlyPrecondition extends SlashCommandPrecondition {
   public run(interaction: CommandInteraction): SlashCommandPreconditionResult {
      return interaction.guild === null
         ? this.error({
              identifier: Identifiers.PreconditionGuildOnly,
              message: "You cannot run this command in DMs.",
           })
         : this.ok();
   }
}
