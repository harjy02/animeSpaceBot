import {
   SlashCommandPrecondition,
   SlashCommandPreconditionResult,
} from "lib/slashCommands/framework/lib/structures/SlashCommandPrecondition";

import type { CommandInteraction } from "discord.js";
import { envSupportGuild } from "assets/config";

export class OwnerOnlyPrecondition extends SlashCommandPrecondition {
   public run(interaction: CommandInteraction): SlashCommandPreconditionResult {
      return interaction.guildId === envSupportGuild
         ? this.ok()
         : this.error({
              message:
                 "This command is still in development, it is public to use only in the support server by beta testers",
           });
   }
}
