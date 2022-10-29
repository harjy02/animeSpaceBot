import {
   Events,
   SlashCommandErrorPayload,
} from "lib/slashCommands/framework/lib/types/Events";
import { Listener, ListenerOptions, UserError } from "@sapphire/framework";

import { catchNewError } from "lib/errors/errorHandling";
import { errorEmbed } from "lib/tools/error/errorEmbed";
import { supportServerInviteLink } from "assets/config";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<ListenerOptions>({
   event: Events.SlashCommandError,
})
export default class SlashCommandError extends Listener<typeof Events.SlashCommandError> {
   public async run(
      error: UserError,
      { interaction }: SlashCommandErrorPayload,
   ): Promise<void> {
      const method = interaction.replied ? "followUp" : "reply";

      const additionalData = {
         content: interaction.options,
         chat: {
            channelType: interaction.channel?.type,
            messageId: interaction.id,
         },
         guild: {
            name: interaction.guild ? interaction.guild.name : "N/A",
            id: interaction.guild ? interaction.guild.id : "N/A",
         },
      };

      const errorId = catchNewError(error, additionalData);

      const embed = errorEmbed(
         `Oops something went wrong, if this problem persists consider reporting it to the [support server](${supportServerInviteLink}).\n\nError id: \`${errorId}\``,
      );

      await interaction[method]({
         embeds: [embed],
         ephemeral: true,
      });
   }
}
