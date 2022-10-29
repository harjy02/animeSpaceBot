import { InteractionReplyOptions, Message, ReplyMessageOptions } from "discord.js";

import { alertEmbed } from "lib/tools/error/alertEmbed";
import { ReplyInteractions } from "typings/discord/main";

export async function unConnected(
   interaction: Message,
   options?: ReplyMessageOptions,
): Promise<void>;
export async function unConnected(
   interaction: ReplyInteractions,
   options?: InteractionReplyOptions,
): Promise<void>;
export function unConnected(
   interaction: Message | ReplyInteractions,
   options?: ReplyMessageOptions | InteractionReplyOptions,
) {
   const embed = alertEmbed(
      "This command requires a connected profile from :anilist: to be executed, to connect a profile use the command `/connect`",
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
