import type { CommandInteraction, TextBasedChannel } from "discord.js";
import {
   SlashCommandPrecondition,
   SlashCommandPreconditionResult,
} from "lib/slashCommands/framework/lib/structures/SlashCommandPrecondition";

import { Identifiers } from "lib/slashCommands/framework/lib/errors/Identifiers";

export class GuildTextOnlyPrecondition extends SlashCommandPrecondition {
   private readonly allowedTypes: TextBasedChannel["type"][] = [
      "GUILD_TEXT",
      "GUILD_PUBLIC_THREAD",
      "GUILD_PRIVATE_THREAD",
   ];

   public run(interaction: CommandInteraction): SlashCommandPreconditionResult {
      return interaction.channel && this.allowedTypes.includes(interaction.channel.type)
         ? this.ok()
         : this.error({
              identifier: Identifiers.PreconditionGuildTextOnly,
              message: "You can only run this command in server text channels.",
           });
   }
}
