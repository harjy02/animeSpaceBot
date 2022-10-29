import {
   SlashCommandPrecondition,
   SlashCommandPreconditionResult,
} from "lib/slashCommands/framework/lib/structures/SlashCommandPrecondition";

import type { CommandInteraction } from "discord.js";
import { Identifiers } from "lib/slashCommands/framework/lib/errors/Identifiers";

export class GuildPublicThreadOnlyPrecondition extends SlashCommandPrecondition {
   public run(interaction: CommandInteraction): SlashCommandPreconditionResult {
      return interaction.channel?.isThread() &&
         interaction.channel?.type === "GUILD_PUBLIC_THREAD"
         ? this.ok()
         : this.error({
              identifier: Identifiers.PreconditionGuildPublicThreadOnly,
              message: "You can only run this command in public server thread channels.",
           });
   }
}
