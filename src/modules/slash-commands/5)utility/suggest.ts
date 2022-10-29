import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import { CommandInteraction, Message, MessageButton, MessageEmbed } from "discord.js";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { setComponent } from "lib/discordComponents/component";
import { ButtonRow } from "lib/discordComponents/button";
import { suggestionLogger } from "lib/loggers/suggestionLogger";
import { asTree } from "lib/tools/treeify";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description: "allows you to make a suggestion to bot devs",
      usage: "To make a suggestion just run the slash command /suggest and then write in the first argument your suggestion",
      structure: "/suggest <your suggestion>",
      example: "`/suggest add something new...` etc..",
   },
   arguments: [
      {
         name: "suggestion",
         description: "The suggestion you want to make to bot devs",
         type: "STRING",
         required: true,
      },
   ],
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      //#region [args]

      const authorId = interaction.user.id;
      const authorName = interaction.user.username;
      const suggestion = interaction.options.getString("suggestion")!;

      //#endregion

      const suggestionEmbed = new MessageEmbed()
         .setTitle("Suggestion confirmation")
         .setDescription(
            [
               "confirm to send the following suggestion?",
               "",
               "> Content of suggestion:",
               suggestion,
            ].join("\n"),
         );

      const buttonRow = new ButtonRow([confirmButton, denyButton]);

      const sent = (await interaction.reply({
         embeds: [suggestionEmbed],
         components: setComponent(buttonRow),
         fetchReply: true,
         ephemeral: true,
      })) as Message;

      const collector = sent.createMessageComponentCollector();

      collector.on("collect", async (collectInteraction) => {
         if (collectInteraction.user.id !== authorId) {
            return collectInteraction.reply({
               content: "This interaction is not for you..",
               ephemeral: true,
            });
         }

         switch (collectInteraction.customId) {
            case "confirm": {
               collector.stop("confirm");

               const data = {
                  author: {
                     id: authorId,
                     name: authorName,
                  },
                  guild: {
                     name: collectInteraction.guild
                        ? collectInteraction.guild.name
                        : "N/A",
                     id: collectInteraction.guild ? collectInteraction.guild.id : "N/A",
                  },
                  suggestionContent: suggestion,
               };

               suggestionLogger.suggestion(asTree(data));

               return collectInteraction.update({
                  embeds: [
                     suggestionEmbed.setDescription(
                        [
                           "suggestion sent to the developers!",
                           "",
                           "> Content of sent suggestion:",
                           suggestion,
                        ].join("\n"),
                     ),
                  ],
                  components: [],
               });
            }

            case "deny": {
               collector.stop("denied");

               return collectInteraction.update({
                  embeds: [
                     suggestionEmbed.setDescription(
                        [
                           "Denied!, operation cancelled",
                           "",
                           "> Content of cancelled suggestion:",
                           suggestion,
                        ].join("\n"),
                     ),
                  ],
                  components: [],
               });
            }
         }
      });
   }
}

const confirmButton = new MessageButton()
   .setCustomId("confirm")
   .setLabel("Send suggestion")
   .setStyle("SUCCESS");

const denyButton = new MessageButton()
   .setCustomId("deny")
   .setLabel("Exit")
   .setStyle("DANGER");
