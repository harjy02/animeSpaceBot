import { CommandInteraction, MessageEmbed, TextBasedChannel } from "discord.js";

import { catchNewError } from "lib/errors/errorHandling";
import { SlashCommand } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { alertEmbed } from "lib/tools/error/alertEmbed";
import { errorEmbed } from "lib/tools/error/errorEmbed";
import { stringParam } from "lib/tools/text/stringParam";

export abstract class BotSlashCommand extends SlashCommand {
   public alertEmbed = alertEmbed;
   public errorEmbed = errorEmbed;

   public catchAutocompleteError(error: any) {
      catchNewError(error);
   }

   public nsfwCheck(channel: TextBasedChannel) {
      const channelNsfwCheck =
         channel.type !== "DM" && !channel.isThread() && !channel.nsfw;

      return channelNsfwCheck;
   }

   public commandInfo(interaction: CommandInteraction) {
      try {
         const usageEmbed = new MessageEmbed().addField(
            "> Description:",
            stringParam(this.options.info.description || "no description here..."),
         );

         if (this.options.info) {
            const requirements = this.options.info.requirements;
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

            const usage = this.options.info.usage;
            if (usage) {
               if (Array.isArray(usage))
                  usageEmbed.addField("> Usage info:", stringParam(usage.join("\n")));
               else usageEmbed.addField("> Usage info:", stringParam(usage));
            }

            const structure = this.options.info.structure;
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

            const examples = this.options.info.example;
            if (examples) {
               if (Array.isArray(examples))
                  usageEmbed.addField("> Examples:", stringParam(examples.join("\n")));
               else usageEmbed.addField("> Examples:", stringParam(examples));
            }
         }

         interaction.reply({ embeds: [usageEmbed] });
      } catch (error) {
         throw error;
      }
   }
}
