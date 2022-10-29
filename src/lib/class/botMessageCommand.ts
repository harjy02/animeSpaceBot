import { Message, MessageEmbed, TextBasedChannel } from "discord.js";

import { Command } from "@sapphire/framework";
import { alertEmbed } from "lib/tools/error/alertEmbed";
import { stringParam } from "lib/tools/text/stringParam";

export abstract class BotMessageCommand extends Command {
   public nsfwCheck(channel: TextBasedChannel) {
      const channelNsfwCheck =
         channel.type !== "DM" && !channel.isThread() && !channel.nsfw;

      return channelNsfwCheck;
   }

   public alert(message: Message, text: string) {
      const embed = alertEmbed(text);

      return message.reply({ embeds: [embed] });
   }

   public commandInfo(message: Message) {
      try {
         const usageEmbed = new MessageEmbed().addField(
            "> Description:",
            stringParam(this.options.description || "no description here..."),
         );

         const requirements = this.options.requirements;
         if (requirements) {
            if (Array.isArray(requirements)) {
               usageEmbed.addField(
                  "> Requirements:",
                  stringParam(requirements.join("\n")),
               );
            } else {
               usageEmbed.addField("> Requirements:", stringParam(requirements));
            }
         }

         const usage = this.options.usage;
         if (usage) {
            if (Array.isArray(usage))
               usageEmbed.addField("> Usage info:", stringParam(usage.join("\n")));
            else usageEmbed.addField("> Usage info:", stringParam(usage));
         }

         const structure = this.options.structure;
         if (structure) {
            if (Array.isArray(structure)) {
               usageEmbed.addField(
                  "> Command structure:",
                  stringParam(structure.join("\n")),
               );
            } else {
               usageEmbed.addField("> Command structure:", stringParam(structure));
            }
         }

         const examples = this.options.example;
         if (examples) {
            if (Array.isArray(examples))
               usageEmbed.addField("> Examples:", stringParam(examples.join("\n")));
            else usageEmbed.addField("> Examples:", stringParam(examples));
         }

         message.reply({ embeds: [usageEmbed] });
      } catch (error) {
         throw error;
      }
   }
}
