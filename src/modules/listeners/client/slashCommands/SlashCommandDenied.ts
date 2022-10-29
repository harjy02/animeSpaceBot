import {
   Events,
   SlashCommandDeniedPayload,
} from "lib/slashCommands/framework/lib/types/Events";
import { Listener, ListenerOptions, UserError } from "@sapphire/framework";

import { MessageEmbed } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<ListenerOptions>({
   event: Events.SlashCommandDenied,
})
export default class SlashCommandDenied extends Listener<
   typeof Events.SlashCommandDenied
> {
   public async run(error: UserError, payload: SlashCommandDeniedPayload): Promise<void> {
      const method = payload.interaction.replied ? "followUp" : "reply";
      const embed = new MessageEmbed()
         .setTitle("Command denied")
         .setDescription(error.message)
         .setColor(0xff4400);

      await payload.interaction[method]({
         embeds: [embed],
         ephemeral: true,
      });
   }
}
