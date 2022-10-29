import { CommandInteraction, Message, MessageButton, MessageEmbed } from "discord.js";
import { disableComponent, setComponent } from "lib/discordComponents/component";

import { ApplyOptions } from "@sapphire/decorators";
import { BotSlashCommand } from "lib/class/botSlashCommand";
import { ButtonRow } from "lib/discordComponents/button";
import { Pick } from "lib/commands/pick/pick";
import type { SlashCommandOptions } from "lib/slashCommands/framework/lib/structures/SlashCommand";
import { unConnected } from "lib/templates/unConnected";
import { getUserData } from "cluster/anilist/libs/userData";
import { dmGuild } from "assets/reference";
import { catchNewError } from "lib/errors/errorHandling";

@ApplyOptions<SlashCommandOptions>({
   info: {
      description:
         "By using this command you will be able to pick randomly an anime or a manga from your planning list",
      requirements:
         "This command requires to be connected to an :anilist: profile (by running `/connect`)",
      usage: "To use this command just run it without any argument and then use the buttons to pick an anime or a manga from planning",
   },
   enabled: false,
})
export default class extends BotSlashCommand {
   public async run(interaction: CommandInteraction): Promise<void> {
      //#region [args]

      const authorId = interaction.user.id;
      const guild = interaction.channel?.type === "DM" ? await dmGuild : interaction.guild;

      //#endregion

      if (!guild)
         return interaction.reply("Command can only be executed in a guild or in DM");

      const userData = await getUserData(guild?.id, authorId);
      if (!userData) return unConnected(interaction, { ephemeral: true });

      const pickData = new Pick(userData, guild.id, authorId);

      const buttonRow = new ButtonRow([pickAnime, pickManga]);
      const embed = new MessageEmbed()
         .setTitle("Picker from planning list")
         .setDescription(
            "Use one of the 2 buttons 'Anime' or 'Manga' to pick respectively from your anime planning list or manga planning list a media randomly",
         );

      const sent = (await interaction.reply({
         embeds: [embed],
         components: setComponent(buttonRow),
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
            case "Anime": {
               const animeEmbed = await pickData.pickFromPlanning("ANIME");

               return collectInteraction.update({
                  embeds: [animeEmbed],
               });
            }
            case "Manga": {
               const mangaEmbed = await pickData.pickFromPlanning("MANGA");

               return collectInteraction.update({
                  embeds: [mangaEmbed],
               });
            }
         }
      });
      collector.on("end", (_listener, reason) => {
         switch (reason) {
            case "idle": {
               sent.edit({ components: disableComponent(buttonRow) });
               break;
            }
            default: {
               throw catchNewError(reason);
            }
         }
      });
   }
}
const pickAnime = new MessageButton()
   .setCustomId("Anime")
   .setLabel("Anime")
   .setStyle("PRIMARY");

const pickManga = new MessageButton()
   .setCustomId("Manga")
   .setLabel("Manga")
   .setStyle("PRIMARY");
