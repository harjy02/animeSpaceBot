import { CommandInteraction, Message, MessageButton, MessageEmbed } from "discord.js";
import { disableComponent, setComponent } from "lib/discordComponents/component";

import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import { ButtonRow } from "lib/discordComponents/button";
import { RandomMedia } from "lib/commands/randomMedia/randomMedia";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { addPlanningButton } from "modules/listeners/client/interactions/modules/addPlanning/addPlanningButtonListener";
import { textJoin } from "lib/tools/text/textJoin";
import { catchNewError } from "lib/errors/errorHandling";
import { findOrCreateDiscordGuild } from "cluster/anilist/libs/discordGuild";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description:
         "This command allows you to randomly search new anime to watch or manga to read",
      usage: "To use this command just run `/randommedia` without any argument and then use the buttons to roll the search",
   },
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      //#region [args]

      const guild =
         interaction.channel?.type === "DM"
            ? await findOrCreateDiscordGuild({ id: "0", name: "DM" })
            : interaction.guild;
      const authorId = interaction.user.id;

      //#endregion

      if (!guild) return interaction.reply("command only executable in a guild or in dm");

      const randomMedia = new RandomMedia(guild.id, authorId);
      const startEmbed = new MessageEmbed().setDescription(
         textJoin([
            "Use the button **roll anime** to get a random anime",
            "Use the button **roll manga** to get a random manga",
            "",
            "When a random media is generated also the button **add to planning** will appear, this will consent to add the anime to your planning list, it required to be logged in (by using the command **-login**)",
         ]),
      );

      const buttonsRow = new ButtonRow([rollAnimeButton, rollMangaButton]);

      const sent = (await interaction.reply({
         embeds: [startEmbed],
         components: setComponent(buttonsRow),
         fetchReply: true,
      })) as Message;

      const collector = sent.createMessageComponentCollector({
         idle: 300000,
      });

      collector.on("collect", async (collectInteraction) => {
         if (collectInteraction.user.id !== authorId) {
            return collectInteraction.reply({
               content: "This interaction is not for you..",
               ephemeral: true,
            });
         }

         switch (collectInteraction.customId) {
            case "rollAnime": {
               const searchObj = await randomMedia.getAnime();

               const embed = searchObj.embed;
               const idAl = searchObj.idAl;
               const idMal = searchObj.idMal;

               const newButtonsRow = new ButtonRow([
                  rollAnimeButton,
                  rollMangaButton,
                  addPlanningButton({ idMal, idAl }),
               ]);

               return collectInteraction.update({
                  embeds: [embed],
                  components: setComponent(newButtonsRow),
               });
            }
            case "rollManga": {
               const searchObj = await randomMedia.getManga();

               const embed = searchObj.embed;
               const idAl = searchObj.idAl;
               const idMal = searchObj.idMal;

               const newButtonsRow = new ButtonRow([
                  rollAnimeButton,
                  rollMangaButton,
                  addPlanningButton({ idMal, idAl }),
               ]);

               return collectInteraction.update({
                  embeds: [embed],
                  components: setComponent(newButtonsRow),
               });
            }
         }
      });
      collector.on("end", async (_collected, reason) => {
         switch (reason) {
            case "idle": {
               sent.edit({ components: disableComponent(buttonsRow) });
               break;
            }
            default: {
               throw catchNewError(reason);
            }
         }
      });
   }
}
const rollAnimeButton = new MessageButton()
   .setCustomId("rollAnime")
   .setLabel("roll Anime")
   .setStyle("PRIMARY");

const rollMangaButton = new MessageButton()
   .setCustomId("rollManga")
   .setLabel("roll Manga")
   .setStyle("PRIMARY");
