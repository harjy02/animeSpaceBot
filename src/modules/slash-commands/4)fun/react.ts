import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import type { AutocompleteInteraction, CommandInteraction } from "discord.js";
import {
   getReactEmbed,
   getReactOptions,
   ReactionCategories,
} from "lib/commands/animePic/reactCollection";

const reactionCategories = new Map([
   ["bully", "bullying"],
   ["cuddle", "cuddling"],
   ["cry", ""],
   ["hug", "hugging"],
   ["awoo", ""],
   ["kiss", "kissing"],
   ["pat", "patting"],
   ["smug", ""],
   ["bonk", "bonking"],
   ["yeet", "yeeting"],
   ["blush", ""],
   ["smile", "smiling at"],
   ["wave", "waving at"],
   ["highfive", "highfiving"],
   ["handhold", "hand-holding"],
   ["nom", ""],
   ["bite", "biting"],
   ["glomp", ""],
   ["slap", "slapping"],
   ["kill", "killing"],
   ["kick", "kicking"],
   ["happy", ""],
   ["wink", "winking at"],
   ["poke", "poking"],
   ["dance", ""],
   ["cringe", ""],
]);

@ApplyOptions<SlashCommandOptions>({
   info: {
      description: "React using anime related content GIFs",
   },
   arguments: [
      {
         name: "reaction-type",
         description: "The type of reaction you want to send",
         type: "STRING",
         autocomplete: true,
         required: true,
      },
      {
         name: "user",
         description: "the user that will receive the reaction",
         type: "USER",
         required: false,
      },
   ],
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      const category = interaction.options.getString("reaction-type", true);
      const user = interaction.options.getUser("user");

      const manualInput = () => {
         interaction.reply({
            content: `The reaction-type was typed manually, if you didn't find what you were looking for then it probably doesn't exist.\nPlease select something from the autocomplete list while typing the command.`,
            ephemeral: true,
         });
      };

      let selectedCategory = "";

      if (category.startsWith("[") && category.endsWith("]"))
         selectedCategory = category.slice(1, category.length - 1);
      else return manualInput();

      const embed = await getReactEmbed(selectedCategory as ReactionCategories);

      if (user) {
         const reaction = reactionCategories.get(selectedCategory);

         if (!reaction) {
            embed.setDescription(
               `<@${interaction.user.id}> reacted to <@${user.id}> with \`${selectedCategory}\` `,
            );
         } else {
            embed.setDescription(
               `<@${interaction.user.id}> is ${reaction} <@${user.id}>`,
            );
         }
      } else {
         embed.setDescription(
            `<@${interaction.user.id}> reacted with \`${selectedCategory}\` `,
         );
      }

      interaction.reply({
         embeds: [embed],
      });
   }
   public async autocomplete(interaction: AutocompleteInteraction) {
      try {
         const category = interaction.options.getFocused(true).value as string;

         const applicationChoice = getReactOptions(category);

         interaction.respond(applicationChoice);
      } catch (error: any) {
         this.catchAutocompleteError(error);
      }
   }
}
