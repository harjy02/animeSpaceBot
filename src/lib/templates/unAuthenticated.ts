import { InteractionReplyOptions, Message, ReplyMessageOptions } from "discord.js";

import { alertEmbed } from "lib/tools/error/alertEmbed";
import { ReplyInteractions } from "typings/discord/main";

export async function unAuthenticated(
   interaction: Message,
   options?: ReplyMessageOptions,
): Promise<void>;
export async function unAuthenticated(
   interaction: ReplyInteractions,
   options?: InteractionReplyOptions,
): Promise<void>;
export async function unAuthenticated(
   interaction: Message | ReplyInteractions,
   options?: ReplyMessageOptions | InteractionReplyOptions,
) {
   const embed = alertEmbed(
      "This interaction requires authentication to be used.\nTo authenticate with your anilist account use the command `/login`",
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
