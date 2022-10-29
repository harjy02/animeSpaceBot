import {
   SlashCommandPrecondition,
   SlashCommandPreconditionResult,
} from "lib/slashCommands/framework/lib/structures/SlashCommandPrecondition";

import type { CommandInteraction } from "discord.js";
import { Identifiers } from "lib/slashCommands/framework/lib/errors/Identifiers";

export class GuildPrivateThreadOnlyPrecondition extends SlashCommandPrecondition {
   public run(interaction: CommandInteraction): SlashCommandPreconditionResult {
      return interaction.channel?.isThread() &&
         interaction.channel?.type === "GUILD_PRIVATE_THREAD"
         ? this.ok()
         : this.error({
              identifier: Identifiers.PreconditionGuildPrivateThreadOnly,
              message: "You can only run this command in private server thread channels.",
           });
   }
}
