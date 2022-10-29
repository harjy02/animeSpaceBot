import { CommandErrorPayload, Events, Listener, UserError } from "@sapphire/framework";

import { catchNewError } from "lib/errors/errorHandling";
import { errorEmbed } from "lib/tools/error/errorEmbed";
import { supportServerInviteLink } from "assets/config";

export default class extends Listener<typeof Events.CommandError> {
   public async run(error: UserError, { message }: CommandErrorPayload) {
      const additionalData = {
         content: message.content,
         chat: {
            channelType: message.channel.type,
            messageId: message.id,
         },
         guild: {
            name: message.guild ? message.guild.name : "N/A",
            id: message.guild ? message.guild.id : "N/A",
         },
      };

      const errorId = catchNewError(error, additionalData);

      const embed = errorEmbed(
         `Oops something went wrong, if this problem persists consider reporting it to the [support server](${supportServerInviteLink}).\n\nError id: \`${errorId}\``,
      );

      return message.channel.send({ embeds: [embed] }).catch();
   }
}
