import { InteractionReplyOptions, Message, ReplyMessageOptions } from "discord.js";

import { alertEmbed } from "lib/tools/error/alertEmbed";
import { ReplyInteractions } from "typings/discord/main";

export async function unAuthorised(
   interaction: Message,
   options?: ReplyMessageOptions,
): Promise<void>;
export async function unAuthorised(
   interaction: ReplyInteractions,
   options?: InteractionReplyOptions,
): Promise<void>;
export async function unAuthorised(
   interaction: Message | ReplyInteractions,
   options?: ReplyMessageOptions | InteractionReplyOptions,
) {
   const embed = alertEmbed(
      "You lack of authorisation/permissions to execute this command.",
   );

   if (interaction instanceof Message) {
      return interaction.reply({ embeds: [embed], ...(options as ReplyMessageOptions) });
   } else {
      return interaction.reply({
         embeds: [embed],
         ...(options as InteractionReplyOptions),
      });
   }
}
